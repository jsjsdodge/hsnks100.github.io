# asio tutorial1
거창하게 asio tutorial 이라고 제목은 지어놨는데, 나또한 써보면서 익힌 기능들이나 활용법에 대해서 글을 쓰겠다. asio 는 기본적으로 network 에 대해 특화되었지만, file I/O 에 대해서도 충분히 사용가능하다. 그리고 asio 를 쓰면서 흔히 실수하기 쉬운 사례도 들면서 진행하려 한다. 

Boost.Asio is a cross-platform C++ library for network and low-level I/O programming that provides developers with a consistent asynchronous model using a modern C++ approach.

Boost.Asio 는 네트워크와 저수준 I/O programming 을 위한 크로스 플랫폼 C++ library 다. 관련된 기능을 수행하면서 관련되는 동시성 문제나 lock 문제들을 명시적/암시적으로 modern c++ 스럽게 해결 할 수 있는 도구를 제공해준다.

원론적인 설명을 더 보고 싶으면 boost asio 홈페이지에 들어가서 관련 내용을 더 보시라.

# install

```
sudo apt-get install libboost-all-dev
```

CMakeLists.txt
```
CMAKE_MINIMUM_REQUIRED ( VERSION 2.8 )
include(${CMAKE_ROOT}/Modules/ExternalProject.cmake)
SET(srcs
  main.cpp
  )

add_executable(app.out ${srcs})
target_link_libraries(app.out
  boost_system
  boost_thread 
  )
```

debian 계열 기준으로 위와 같이 설치하면 해당 시스템에서 boost 를 사용할 수 있다.

나머지는 몰라, 알아서 해. 

```cpp
//
// timer.cpp
// ~~~~~~~~~
//
// Copyright (c) 2003-2017 Christopher M. Kohlhoff (chris at kohlhoff dot com)
//
// Distributed under the Boost Software License, Version 1.0. (See accompanying
// file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)
//

#include <iostream>
#include <boost/asio.hpp>
#include <boost/date_time/posix_time/posix_time.hpp>

int main()
{
  boost::asio::io_service io;

  boost::asio::deadline_timer t(io, boost::posix_time::seconds(5));
  t.wait();

  std::cout << "Hello, world!" << std::endl;

  return 0;
}
```

asio 는 하나이상의 io_service 를 포함한다. deadline_timer 는 시간과 관련된 wait 나 timeout 을 구현하기 위해 쓴다. 여기서는 wait 를 쓴다.

t.wait(); 하는 순간 5초가 block 되고 5초가 끝나면 Hello, world! 가 출력된다.

# asyncronously timer1

```cpp
//
// timer.cpp
// ~~~~~~~~~
//
// Copyright (c) 2003-2017 Christopher M. Kohlhoff (chris at kohlhoff dot com)
//
// Distributed under the Boost Software License, Version 1.0. (See accompanying
// file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)
//

#include <iostream>
#include <boost/asio.hpp>
#include <boost/date_time/posix_time/posix_time.hpp>

void print(const boost::system::error_code& /*e*/)
{
  std::cout << "Hello, world!" << std::endl;
}

int main()
{
  boost::asio::io_service io;

  boost::asio::deadline_timer t(io, boost::posix_time::seconds(5));
  t.async_wait(&print);

  io.run();

  return 0;
}
```

io_service::run() 에 대해서는 몇가지 알고 가야되는 사실이 있다. 
 - run 은 모든 작업이 완료되기전까지 리턴되지 않는다. 
 - run 안에서 일어나는 콜백 함수들은 run 이 콜된 스레드내부에서 호출된다. 같은 스레드를 가진다.

io_service::run(); 을 통해서만 async 동작이 수행된다. 그리고 위 예제에서는 io.run(); 이 수행되면서 main 이 멈춘 상태로 5 초 멈추고 Hello, world! 를 출력하게 된다. 

# asyncronously timer2



```cpp
//
// timer.cpp
// ~~~~~~~~~
//
// Copyright (c) 2003-2017 Christopher M. Kohlhoff (chris at kohlhoff dot com)
//
// Distributed under the Boost Software License, Version 1.0. (See accompanying
// file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)
//

#include <iostream>
#include <boost/asio.hpp>
#include <boost/bind.hpp>
#include <boost/date_time/posix_time/posix_time.hpp>

void print(const boost::system::error_code& /*e*/,
    boost::asio::deadline_timer* t, int* count)
{
  if (*count < 5)
  {
    std::cout << *count << std::endl;
    ++(*count);

    t->expires_at(t->expires_at() + boost::posix_time::seconds(1));
    t->async_wait(boost::bind(print,
          boost::asio::placeholders::error, t, count));
  }
}

int main()
{
  boost::asio::io_service io;

  int count = 0;
  boost::asio::deadline_timer t(io, boost::posix_time::seconds(1));
  t.async_wait(boost::bind(print,
        boost::asio::placeholders::error, &t, &count));

  io.run();

  std::cout << "Final count is " << count << std::endl;

  return 0;
}
```

이 예제는 asyncronously timer1 의 예제는 살짝 바꾼 버전이다. 어떻게 우리가 정의한 함수에 콜백 파라메터를 넘기는지 잘 보여주고 있다.

그리고 주목해야 할 점은 io_serivce 가 명시적인 stop 이 없이 모든 작업이 완료되고 나서 마지막 문장을 출력하고 끝이 난다. 처음에 말해두었듯이 asio 는 모든 작업이 끝나면 리턴된다. 그리고 print 함수는 async_wait 를 통해 재귀호출을 하면서 수명을 연장해 나가면서 마지막에는 async_wait 를 하지 않으면서 끝이 나게 된다.



# Synchronising handlers in multithreaded programs

```cpp
//
// timer.cpp
// ~~~~~~~~~
//
// Copyright (c) 2003-2016 Christopher M. Kohlhoff (chris at kohlhoff dot com)
//
// Distributed under the Boost Software License, Version 1.0. (See accompanying
// file LICENSE_1_0.txt or copy at http://www.boost.org/LICENSE_1_0.txt)
//

#include <iostream>
#include <boost/asio.hpp>
#include <boost/thread/thread.hpp>
#include <boost/bind.hpp>
#include <boost/date_time/posix_time/posix_time.hpp>

class printer
{
public:
  printer(boost::asio::io_service& io)
    : strand_(io),
      timer1_(io, boost::posix_time::seconds(1)),
      timer2_(io, boost::posix_time::seconds(1)),
      count_(0)
  {
    timer1_.async_wait(strand_.wrap(boost::bind(&printer::print1, this)));
    timer2_.async_wait(strand_.wrap(boost::bind(&printer::print2, this)));
  }

  ~printer()
  {
    std::cout << "Final count is " << count_ << std::endl;
  }

  void print1()
  {
    if (count_ < 10)
    {
      std::cout << "Timer 1: " << count_ << std::endl;
      ++count_;

      timer1_.expires_at(timer1_.expires_at() + boost::posix_time::seconds(1));
      timer1_.async_wait(strand_.wrap(boost::bind(&printer::print1, this)));
    }
  }

  void print2()
  {
    if (count_ < 10)
    {
      std::cout << "Timer 2: " << count_ << std::endl;
      ++count_;

      timer2_.expires_at(timer2_.expires_at() + boost::posix_time::seconds(1));
      timer2_.async_wait(strand_.wrap(boost::bind(&printer::print2, this)));
    }
  }

private:
  boost::asio::io_service::strand strand_;
  boost::asio::deadline_timer timer1_;
  boost::asio::deadline_timer timer2_;
  int count_;
};

int main()
{
  boost::asio::io_service io;
  printer p(io);
  boost::thread t(boost::bind(&boost::asio::io_service::run, &io));
  io.run();
  t.join();

  return 0;
}
```

이 예제에서는 strand 를 이용하여 멀티 스레드 환경에서 콜백 핸들러를 동기화하는 방법을 보여준다. 지금까지의 예제에서는 run 이 싱글스레드로 작동하여 동시성 문제가 발생하지 않았지만, 지금 예제에서는 서로다른 스레드에서 run 이 수행된다. 멀티 스레드 방식은 특정 I/O 처리기가 오래 걸리거나 할 때 스레드를 여러개로 늘려서 수행 할 수 있는 작업은 수행할 수 있도록 한다. 

이 예제에서는 모든 함수 print1, print2 가 하나의 strand 로 묶이는 예제라 서로 간섭을 하지 않는다.

즉, 요약하면 하나의 같은 strand 내의 asyncronos function 은 동시에 실행되지 않는다. (매우 

