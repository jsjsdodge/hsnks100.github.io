# 라즈베리파이2 와 함께 하는 리눅스 드라이버 프로그래밍

취미로 드라이버 프로그래밍을 공부하면서 남기는 로그

나 스스로도 아직 잘 모르기 때문에 틀린 점이나 부족한 부분이 많을텐데 감안해주고 보면 감사하겠다.

시중에는 i386 기준으로 프린터포트를 가지고 실습하는 책도 나와있는데, 굳이 라즈베리파이2(이하 rpi2) 가지고 하는 이유는 접근성과 대중성, cross compile 없이 local compile 이 가능하다.
또한, 커널 드라이버 프로그래밍 특성상 문제시 재부팅해야하는 경우가 빈번한데 host 컴퓨터를 부팅하기에는 시간적, 심리적 부담이 크다.

글의 목표는 최대한 예제 코드는 간단히, 개념은 자세히!

