# asio tutorial1
거창하게 asio tutorial 이라고 제목은 지어놨는데, 나또한 써보면서 익힌 기능들이나 활용법에 대해서 글을 쓰겠다.

Boost.Asio is a cross-platform C++ library for network and low-level I/O programming that provides developers with a consistent asynchronous model using a modern C++ approach.

Boost.Asio 는 네트워크와 저수준 I/O programming 을 위한 크로스 플랫폼 C++ library 다. 관련된 기능을 수행하면서 관련되는 동시성 문제나 lock 문제들을 명시적/암시적으로 modern c++ 스럽게 해결 할 수 있는 도구를 제공해준다.

원론적인 설명을 더 보고 싶으면 boost asio 홈페이지에 들어가서 관련 내용을 더 보시라

```
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

# asyncronously

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
