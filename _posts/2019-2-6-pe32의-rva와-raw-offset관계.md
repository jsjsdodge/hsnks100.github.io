# RVA, RAW


파일 리버싱에 있어서 RVA 와 RAW offset 을 서로간의 위치 관계를 잘 매핑해야한다. 

여러가지 이유가 있겠지만 그 중 하나는 파일 패치를 위해 바이너리를 고치는 경우, 파일에서 고친부분이 프로세스가 메모리에 올라갔을 때는 몇번지인지 정확히 알 필요가 있다.

RVA 는 메모리상의 주소, RAW 는 파일상의 오프셋으로 정의할 수 있겠다.

찾는 방법은 간단하다. 

 1. RVA 가 속한 섹션 s 를 찾는다.
 2. RAW = RVA - s.VirtualAddress + s.PointerToRawData
 
![image](https://user-images.githubusercontent.com/3623889/52314093-5bc66b00-29f4-11e9-9730-fe597c1b4968.png)

RVA to RAW offset 을 이용하여 간단한 바이너리 패치를 해보자.

그림을 보면 402012 라는 주소에 "Make me ... CD-ROM." 이라는 문자열이 들어있다. 우리는 이 문자열에 마지막에 Good Luck 이라는 글자를 넣고 싶다.

![image](https://user-images.githubusercontent.com/3623889/52314263-3ede6780-29f5-11e9-841c-6e8c9657865d.png)

하지만 해당 주소를 덤프떠보니, 뒤에 우리가 필요한 문자열을 붙일 공간이 없다.

런타임시 실행되는 공간을 보니 아래쪽에 null padding 문자가 잔뜩 있다. 이 부분을 이용하여 패치를 하겠다.

![image](https://user-images.githubusercontent.com/3623889/52314394-c7f59e80-29f5-11e9-9741-f0d64de8feac.png)

먼저 push 402012 를 push 0x4020b2 로 고쳐준다. 
