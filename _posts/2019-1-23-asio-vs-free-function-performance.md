# post method's performance



```cpp
#include <iostream>
#include <boost/asio.hpp>

#include <iostream>
#include <ctime>
#include <ratio>
#include <chrono>


class ChronoDuration {
public:
    std::chrono::high_resolution_clock::time_point m_baseTime;
    void setBaseTime();
    double durationWithBaseTime();
    double duration();
};

void ChronoDuration::setBaseTime() {
    m_baseTime = std::chrono::high_resolution_clock::now();
}
double ChronoDuration::durationWithBaseTime() {
    using namespace std;
    typedef typename chrono::duration<double, milli> doublemillisec;
    chrono::high_resolution_clock::time_point end = chrono::high_resolution_clock::now();
    doublemillisec doubleMilliSec = chrono::duration_cast<doublemillisec>(end - m_baseTime);
    m_baseTime = chrono::high_resolution_clock::now();
    return doubleMilliSec.count();
}
double ChronoDuration::duration() {
    using namespace std;
    typedef typename chrono::duration<double, milli> doublemillisec;
    chrono::high_resolution_clock::time_point end = chrono::high_resolution_clock::now();
    doublemillisec doubleMilliSec = chrono::duration_cast<doublemillisec>(end - m_baseTime);
    return doubleMilliSec.count();
}

class Chrono{
    public:
        static uint64_t tickCount() {
            std::chrono::time_point<std::chrono::system_clock> p1, p2, p3; 
            p2 = std::chrono::system_clock::now();
            auto t = std::chrono::duration_cast<std::chrono::milliseconds>(
                    p2.time_since_epoch()).count();
            return t;
        }
};

ChronoDuration cd;
int callCount = 0;
void tick() {
    callCount++;

    //tick();
    //io_service.post(&tick);
}

int main(void) {
    cd.setBaseTime();

    while(1) {
        tick();
        if(cd.duration() >= 3000) {
            std::cout << callCount << std::endl; 
            break;;
        }
    }
    //io_service.post(&tick);
    //io_service.run();
    return 0;
}
asio post infinite call
#include <iostream>
#include <boost/asio.hpp>

#include <iostream>
#include <ctime>
#include <ratio>
#include <chrono>



class ChronoDuration {
public:
    std::chrono::high_resolution_clock::time_point m_baseTime;
    void setBaseTime();
    double durationWithBaseTime();
    double duration();
};

void ChronoDuration::setBaseTime() {
    m_baseTime = std::chrono::high_resolution_clock::now();
}
double ChronoDuration::durationWithBaseTime() {
    using namespace std;
    typedef typename chrono::duration<double, milli> doublemillisec;
    chrono::high_resolution_clock::time_point end = chrono::high_resolution_clock::now();
    doublemillisec doubleMilliSec = chrono::duration_cast<doublemillisec>(end - m_baseTime);
    m_baseTime = chrono::high_resolution_clock::now();
    return doubleMilliSec.count();
}
double ChronoDuration::duration() {
    using namespace std;
    typedef typename chrono::duration<double, milli> doublemillisec;
    chrono::high_resolution_clock::time_point end = chrono::high_resolution_clock::now();
    doublemillisec doubleMilliSec = chrono::duration_cast<doublemillisec>(end - m_baseTime);
    return doubleMilliSec.count();
}

class Chrono{
    public:
        static uint64_t tickCount() {
            std::chrono::time_point<std::chrono::system_clock> p1, p2, p3; 
            p2 = std::chrono::system_clock::now();
            auto t = std::chrono::duration_cast<std::chrono::milliseconds>(
                    p2.time_since_epoch()).count();
            return t;
        }
};
boost::asio::io_service io_service;
ChronoDuration cd;
int callCount = 0;
void tick() {
    callCount++;

    if(cd.duration() >= 3000) {
        std::cout << callCount << std::endl; 
        return;
    }
    io_service.post(&tick);
}

int main(void) {
    cd.setBaseTime(); 
    io_service.post(&tick);
    io_service.run();
    return 0;
}
```
result
call count:

free function: 100801053
post function: 7858624
1282.6806957553893%
