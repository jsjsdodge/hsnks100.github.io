# boost 


```cpp

//
// reference_counted.cpp
// ~~~~~~~~~~~~~~~~~~~~~
//
// Copyright (c) 2003-2016 Christopher M. Kohlhoff (chris at kohlhoff dot com)
//
// Distributed under the Boost Software License, Version 1.0. (See accompanying
// file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)
//

#include <boost/asio.hpp>
#include <iostream>
#include <memory>
#include <utility>
#include <vector>

using boost::asio::ip::tcp;

// A reference-counted non-modifiable buffer class.
class shared_const_buffer
{
public:
  // Construct from a std::string.
  explicit shared_const_buffer(const std::string& data)
    : data_(new std::vector<char>(data.begin(), data.end())),
      buffer_(boost::asio::buffer(*data_))
  {
  }

  // Implement the ConstBufferSequence requirements.
  typedef boost::asio::const_buffer value_type;
  typedef const boost::asio::const_buffer* const_iterator;
  const boost::asio::const_buffer* begin() const { return &buffer_; }
  const boost::asio::const_buffer* end() const { return &buffer_ + 1; }

private:
  std::shared_ptr<std::vector<char> > data_;
  boost::asio::const_buffer buffer_;
};

class session
  : public std::enable_shared_from_this<session>
{
public:
  session(tcp::socket socket)
    : socket_(std::move(socket))
  {
  }

  void start()
  {
    do_write();
  }

private:
  void do_write()
  {
    std::time_t now = std::time(0);
    shared_const_buffer buffer(std::ctime(&now));

    auto self(shared_from_this());
    boost::asio::async_write(socket_, buffer,
        [this, self](boost::system::error_code /*ec*/, std::size_t /*length*/)
        {
        });
  }

  // The socket used to communicate with the client.
  tcp::socket socket_;
};

class server
{
public:
  server(boost::asio::io_service& io_service, short port)
    : acceptor_(io_service, tcp::endpoint(tcp::v4(), port)),
      socket_(io_service)
  {
    do_accept();
  }

private:
  void do_accept()
  {
    acceptor_.async_accept(socket_,
        [this](boost::system::error_code ec)
        {
          if (!ec)
          {
            std::make_shared<session>(std::move(socket_))->start();
          }

          do_accept();
        });
  }

  tcp::acceptor acceptor_;
  tcp::socket socket_;
};

int main(int argc, char* argv[])
{
  try
  {
    if (argc != 2)
    {
      std::cerr << "Usage: reference_counted <port>\n";
      return 1;
    }

    boost::asio::io_service io_service;

    server s(io_service, std::atoi(argv[1]));

    io_service.run();
  }
  catch (std::exception& e)
  {
    std::cerr << "Exception: " << e.what() << "\n";
  }

  return 0;
}

```


원래의 예제에서는 자료 전송을 위해서 메모리상의 상주하는 멤버변수 같은 메모리가 필요했다. Buffer 는 

 buffers

 One or more buffers containing the data to be written. 
 Although the buffers object may be copied as necessary, ownership of the underlying memory blocks is retained by the caller, 
 which must guarantee that they remain valid until the handler is called.


콜백 핸들러가 호출될 때 까지 이 메모리의 valid 는 보증되어야 한다. 그래서 멤버변수로 잡은 것이다. ConstBufferSequenece 를 이용하면 이러한 작업을 local scope 단위에서 처리할 수 있다.

그러기 위해서는 몇가지 구현사항이 필요하다. ConstBufferSequence 를 만족하기 위해서는 

```cpp
  typedef boost::asio::const_buffer value_type;
  typedef const boost::asio::const_buffer* const_iterator;
  const boost::asio::const_buffer* begin() const { return &buffer_; }
  const boost::asio::const_buffer* end() const { return &buffer_ + 1; }
```

위 구현이 필요한데, 자세한 것은 https://www.boost.org/doc/libs/1_69_0/doc/html/boost_asio/reference/ConstBufferSequence.html 참고하라.

