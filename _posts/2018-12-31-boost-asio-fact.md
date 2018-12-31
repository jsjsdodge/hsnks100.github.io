# 사실.

연속된 async_write 는 불완전하다.

```cpp
#include <iostream>
#include <string>
#include <vector>
#include <boost/asio/connect.hpp>
#include <boost/asio/ip/tcp.hpp> 
#include <boost/asio.hpp>
#include <boost/bind.hpp>
#include <boost/enable_shared_from_this.hpp> 
#include <boost/shared_ptr.hpp> 
#include <boost/circular_buffer.hpp> 
using boost::asio::ip::tcp;
std::vector<std::string> v{
    "[*************************************************]\r\n", 
    "[##################################################]\r\n", 
    "[&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&]\r\n",     
    "[$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$]\r\n"};

void handle_connect(const boost::system::error_code& err) {
}

void handle_write_request(const boost::system::error_code& err, std::size_t length) {
}

int main()
{
  boost::asio::io_service io;
  boost::asio::ip::tcp::endpoint ep(boost::asio::ip::address::from_string("192.168.103.191"), 12645);
  boost::asio::ip::tcp::socket sock(io);
  sock.async_connect(ep, handle_connect);

  for(int i=0; i<100; i++) {
      for (auto& str: v)
          boost::asio::async_write(sock, boost::asio::buffer(str), handle_write_request);
  } 
  io.run();
}
```

를 전송하면 

받는 입장에선

$ nc -l 12645
```
[*************************************************]
[##################################################]
[&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&]
[$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$]
[*************************************************]
[##################################################]
[&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&]
[$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$]
[*************************************************]
[##################################################]
[&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&]
[$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$]
[*************************************************]
[##################################################]
[&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&]
[$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$]
[*******************************************[##################################################]
```

이와 같이 깨짐.
