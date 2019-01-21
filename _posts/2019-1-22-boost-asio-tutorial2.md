# TCP Server Program


```cpp
//
// server.cpp
// ~~~~~~~~~~
//
// Copyright (c) 2003-2016 Christopher M. Kohlhoff (chris at kohlhoff dot com)
//
// Distributed under the Boost Software License, Version 1.0. (See accompanying
// file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)
//

#include <ctime>
#include <iostream>
#include <string>
#include <boost/array.hpp>
#include <boost/bind.hpp>
#include <boost/shared_ptr.hpp>
#include <boost/enable_shared_from_this.hpp>
#include <boost/asio.hpp>
#include <boost/thread/thread.hpp>

using boost::asio::ip::tcp;

std::string make_daytime_string()
{
    using namespace std; // For time_t, time and ctime;
    time_t now = time(0);
    return ctime(&now);
}


class tcp_connection
    : public boost::enable_shared_from_this<tcp_connection>
{
public:
    typedef boost::shared_ptr<tcp_connection> pointer;

    static pointer create(boost::asio::io_service& io_service) {
        return pointer(new tcp_connection(io_service));
    }

    tcp::socket& socket() {
        return socket_;
    }

    void start() {
        message_ = make_daytime_string();

        boost::asio::async_write(socket_, boost::asio::buffer(message_),
                                 boost::bind(&tcp_connection::handle_write, shared_from_this()));
    }

private:
    tcp_connection(boost::asio::io_service& io_service)
        : socket_(io_service)
    {
    }

    void handle_write() {
    }

    tcp::socket socket_;
    std::string message_;
};

class tcp_server
{
public:
    tcp_server(boost::asio::io_service& io_service)
        : acceptor_(io_service, tcp::endpoint(tcp::v4(), 13))
    {
        start_accept();
    }

private:
    void start_accept()
    {
        tcp_connection::pointer new_connection =
            tcp_connection::create(acceptor_.get_io_service());

        acceptor_.async_accept(new_connection->socket(),
                               boost::bind(&tcp_server::handle_accept, this, new_connection,
                                           boost::asio::placeholders::error));
    }

    void handle_accept(tcp_connection::pointer new_connection,
                       const boost::system::error_code& error) {
        if (!error) {
            new_connection->start();
        }

        start_accept();
    }

    tcp::acceptor acceptor_;
};

int main()
{
    try {

        auto t = boost::thread([]() {
                boost::asio::io_service io_service;
                tcp_server server1(io_service);
                io_service.run();
            });

        t.detach();
    }
    catch (std::exception& e) {
        std::cerr << e.what() << std::endl;
    }

    getchar();

    return 0;
}

```

기본적인 TCP program 형태를 asio 로 작성한 모습이다. tcp_server 는 새로운 클라이언트를 받아들이는 역할을 한다. 새로운 클라이언트를 받아들였으면, tcp_connection 에서 각 클라이언트에 대한 처리 로직이 들어가는 구조다. tcp_server 에서 async_accept 를 통해 새 클라이언트를 받으면 내부에서 tcp_connection 을 생성하여 async 로직을 등록한다. 예제에서는 async_write 로 바로 답하고 있지만 보통은 클라이언트가 요청을 하기 때문에, read -> write 서버구조로 만든다.

```cpp
class tcp_connection
    : public boost::enable_shared_from_this<tcp_connection>
```

해당 구조에 대해 이야기가 필요하다. 

이 소스에서 tcp_connection 은 shared_ptr 로 되어있다. 그리고 함수 안에서 생성되기 때문에 생성된 곳의 블록이 끝나면 소멸할 타이밍을 맞는다.

```cpp
    static pointer create(boost::asio::io_service& io_service) {
        return pointer(new tcp_connection(io_service));
    }

    
    void start() {
        message_ = make_daytime_string();

        boost::asio::async_write(socket_, boost::asio::buffer(message_),
                                 boost::bind(&tcp_connection::handle_write, shared_from_this()));
    }
```

생성한 쪽에서 tcp_connection::start 를 호출하게 되는데 문제는 async_write 가 실행되지만 tcp_connection 의 수명이 해당 블록이 끝나자마자 소멸이 되어 handle_write 가 호출되지 못한다. 그리하여 io_service 는 모든 작업이 완료된 것으로 알고 io_service::run 이 리턴되게된다. 

그래서 위 코드와 같이 this 대신에 shared_from_this 를 쓰면 해당 콜백이 불러질 때 까지 this 객체는 수명이 연장된다. 이렇게 중요한 shared_from_this 를 쓰기 위해서는 boost::enable_shared_from<T> 를 상속 받아야 한다. 

이와 같은 템플릿 자가 상속 패턴을 CRTP 라고 하니 궁금한 사람은 따로 구글링해보기 바란다.


  
  
  
  
