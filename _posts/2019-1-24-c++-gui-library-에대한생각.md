# c++-gui-library
두서없이 적는 c++ gui library 에 대한 생각


nana 는 native_handle 가지고 wgl 쓰고 있고

wgl 는 windows 판 glfw 정도로 보면 됨
juce 도 되긴 하던데 
juce 는 opengl 자체를 또 래핑 해놓음

glDraw 이런거 안쓰고 딴거 써야함
imgui 는 opengl 되는 예제가 없었음. 
glfw 에서 그대로 쓸 수 있는게 nanogui
근데 보니까 개념 자체가 다름 gui 가
juce, nana // nano imgui 
이런식으로 묶임
nano, imgui 는 gui 를 렌더링 하는 방식이고 opengl 로

전자는 되도록이면 네이티브하게 케이스바이케이스로 구현체가 있는 느낌

아마 opengl 을 안쓴다면 nana 선택했을 것 같음.


html 처럼 레이아웃 잡는게 편해보여서
