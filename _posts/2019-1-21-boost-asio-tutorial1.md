# asio tutorial1
거창하게 asio tutorial 이라고 제목은 지어놨는데, 나또한 써보면서 익힌 기능들이나 활용법에 대해서 글을 쓰겠다.

Boost.Asio is a cross-platform C++ library for network and low-level I/O programming that provides developers with a consistent asynchronous model using a modern C++ approach.

Boost.Asio 는 네트워크와 저수준 I/O programming 을 위한 크로스 플랫폼 C++ library 다. 관련된 기능을 수행하면서 관련되는 동시성 문제나 lock 문제들을 명시적/암시적으로 modern c++ 스럽게 해결 할 수 있는 도구를 제공해준다.

원론적인 설명을 더 보고 싶으면 boost asio 홈페이지에 들어가서 관련 내용을 더 보시라

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


