# types of perl


There are three basic types of perl variables. If you use $,%, and @, it's sufficient to handle variables in perl.

However, You need complex code structures that represent complex structures.

In perl, it is necessary to know the side grammar of the language to be able to code without difficulty.


#  Basical Usage


# $ Operator

It is a type that only numbers or strings are handled in normal language. Also called a scalar operation, scalar means no directionality. It is used to get the value itself.

```
$var = 1;
$var2 = "string";
$var3 = 333;

print "$var, $var2, $var3"; 

```

You can use it this way. 


# @ array

@ Is the instruction for array type.
You will not be confused with @ => a => array.

```
@arr = ("my", "name", "is", "ksoo"); 

print "$arr[0], $arr[1], $arr[2], $arr[3]\n"; 
```



For array initialization, You declare variable using '@', can put value what you want between parenthesis. 

To access value, You have to use '$' because it is value.

To get the length of an array, use @arr.

```
$arrLength = @arr;
print $arrLength;
```

Perl programmers who want to express explicitly use ```

### % hash
% 는 dictionary(hash) 타입을 나타내는데, 

```
%name2email = (
  "ksoo" => "ksoo@gmail.com",
  "gsoo" => "gsoo@gmail.com"
  "young" => "young@gmail.com"
  );

print "$name2email{ksoo}\n";
print "$name2email{gsoo}\n";
```

이러한 구조로 쓰면 선언은 간단하다.
keys 함수로 key 만 뽑아낼 수도 있으며, 뽑아낸 키를 sort 로 정렬도 가능하다.  
다만 저장된 값을 얻어올 때는 $ 연산자로 구해야 한다. 이는 값 자체는 scalar 이기 때문이다.


# 기본을 넘어서

기본만 알고 모든것을 할 수 있다면 다행이겠지만, 기본을 넘어서야 하는 일도 생긴다. 

여기서는 조금 복잡한 자료구조를 perl 로 표현하는 방법을 살펴 본다.

array 와 hash 는 서로 변환이 가능하다. 앞서 보았던 코드를 보자.

```
%name2email = (
  "ksoo" => "ksoo@gmail.com",
  "gsoo" => "gsoo@gmail.com"
  "young" => "young@gmail.com"
  );

@arr = %name2email; 

```

```
|| $VAR1 = [
||           'young',
||           'young@gmail.com',
||           'ksoo',
||           'ksoo@gmail.com',
||           'gsoo',
||           'gsoo@gmail.com'
||         ];
|| $VAR1 = {
||           'young' => 'young@gmail.com',
||           'ksoo' => 'ksoo@gmail.com',
||           'gsoo' => 'gsoo@gmail.com'
||         };
```

@arr 와 %name2email 을 출력해보면 위와 같이 나온다. 

더 진행하기에 앞서 배열의 index 접근은 [] 를 이용하고, 해시의 접근은 {} 로 한다는 사실을 기억하자.

# reference 와 복잡한 자료구조

이미 소개된 @, $, % 를 이용하여 모든 자료구조를 표현할 수 있을 것 같지만 한가지 빠진 조건이 있다. perl 은 배열이든 해시든 스칼라값만을 원소로 가진다.

예를 들면

```
@arr = ("ksoo", "gsoo");
@values = (1, 2, 3, 4, 5);
$arr[1] = @values; 
```

위 코드의 의도했던 바는 

```
|| $VAR1 = [
||           'ksoo',
||           [
||             1,
||             2,
||             3,
||             4,
||             5
||           ]
||         ];
```

이와 같을 것이다. 하지만 결과는 ['ksoo', 5] 라는 참혹한 결과를 가지게 된다. @values 라는 표현식은 scalar @values 라는 표현식의 줄임이고, scalar @values 는 @values 배열의 크기를 리턴한다.

우리가 원하는 동작을 하게 하려면 어떻게 해야하는가?

perl 에서는 reference (\) 라는게 있다. \ 뒤에 오는 표현식의 reference 를 반환한다.

```
$var1 = "test string";
$var2 = \$var1;

print "$var2\n";
print "${$var2}\n";
print "$$var2\n";

$$var2 = "hello reference";
print "-----------------\n";
print "$var1\n";
```

결과는 

```
|| SCALAR(0x1538050)
|| test string
|| test string
|| -----------------
|| hello reference 
```

$var2 를 출력하고자 했는데 이 값은 SCALAR 의 reference 라고 나온다. reference 의 값을 알기 위해서는 reference 종류에 대한 기호를 쓰고, {} 으로 감싼다.

표현이 명확할 때는 ${$var} 로 쓰지 않고 $$var 으로 써도 인식한다. 그리고 $$var2 를 고쳐본 결과 예상한 대로 원본 $var1 의 값이 바꼈음을 알 수 있다.

```
@language = ("C", "C++", "Java", "Perl", "python");
$arrayRef = \@language;

print ${$arrayRef}[0]; 
print $$arrayRef[0];
print $arrayRef->[0]; 
```

\ 는 변수의 주소를 리턴한다고 했다. 그럼 $arrayRef 는 단순히 @language 의 주소만을 가지고 있다.
변수 앞에 붙이는 $, @, % 등을 sigil 이라고 하는데, perl 5.6 에서부터 sigil{var} 는 -> 로 대체 가능하다.
-> dereference 연산자는 기존의 sigil 이용한 방식보다 훨신 직관적으로 변수의 값을 읽게해준다.

여기서 C를 출력하려면 일단은 scalar 니까 sigil 은 $가 된다.

>$

dereference 해야하니까

>${$arrayRef}

0 번째 요소를 가져와야니까

>${$arrayRef}[0]

여기서 {} 를 제외하면

>$$arrayRef[0]

$arrayRef 는 arrayRef-> 로 대체 가능하다고 했다.  

>$arrayRef->[0]

# 익명 배열, 익명 해시


이어질 복잡한 sigil 에 앞서 익명 배열과 익명 해시에 대해서 간략하게 알아야 한다.

```
$arrayRef = ["C", "C++", "Java", "Perl", "python"]; 
```

위에서 썼던 @ 을 이용해서 배열을 만들고 reference 를 대입했던게 기억날거다. 변수로 만들지 않고 바로 대입하려면 익명 배열을 써야 하는데 [] 를 쓴다.
[] 는 배열을 생성후 배열의 주소를 리턴한다.

마찬가지로 익명 해시는 {} 으로, 해시 변수를 생성하고 reference 를 리턴한다.

# 조금 더 어려운 내용


```
$arrayRef=["C++","JAVA","Perl", [5, 4, 3, 2, 1]];
```

에서 5를 읽어내고 싶으면 어떻게 할까?

$arrayRef 에 주소값이 들어가는데 그 주소값의 내용은 배열이고, 배열의 안의 3 index 값 또한 주소로 들어가있다. 구조가 바로 머리에 잡혀야 한다.

먼저 sigil 은 $ 

>$

dereference 해서 3번째 값을 읽어야 하니까

>$arrayRef->[3]

여기서 다시 dereference 해서 0번째 값

>$arrayRef->[3]->[0]

연속 dereference 일 땐 -> 가 생략이 가능하다. 

>$arrayRef->[3][0]

마치 2차원 배열처럼 쓸 수 있다.

$arrayRef->[3][0] 는 -> 가 sigil[] 으로 바꿀 수 있다고 했다.

```
$arrayRef=["C++","JAVA","Perl", [5, 4, 3, 2, 1]];

print "$arrayRef->[3]->[0]\n";
print "${$arrayRef->[3]}[0]\n";
print "${${$arrayRef}[3]}[0]\n"; 
print "${$$arrayRef[3]}[0]\n"; 
print "${$arrayRef->[3]}[0]\n";
print "$arrayRef->[3][0]\n";
```

6개 모두 같은 표현이다. 잘 살펴보면 마지막 표현이 얼마나 직관적인지 느낌이 올것이다. -> 를 적극적으로 쓰자.

```
$object = [ 10, 20, 30, [100, { 300 => [1,2, { 3=>7 } ] } ] ];
``` 

이제 $object 에서 마지막 7 을 출력해보자.

조금 멍해질 수 있는데 정신차리고 보기좋게 만들어보자.

```
|| $VAR1 = \[
||             10,
||             20,
||             30,
||             [
||               100,
||               {
||                 '300' => [
||                            1,
||                            2,
||                            {
||                              '3' => 7
||                            }
||                          ]
||               }
||             ]
||           ];
```

구조가 좀 눈에 보인다.
일단은 scalar 값을 가져 와야 하니까

>$

이제 슬슬 반복하다보니 익숙해지지 않는가

순서대로 3 index, 1 index

>$object->[3][1]

'300' 이라는 해시키를 만났으니

>$object->[3][1]{300}

해시키의 값은 array 이므로 

>$object->[3][1]{300}[2]

여기서 다시 hash dereference 

>$object->[3][1]{300}[2]{3}

마침내 7 출력.

이 과정을 따라왔다면 아마도 perl 의 reference 관련된 내용에서 헷갈리더라도 혼자 해결할 수 있는 능력을 갖췄을거라 믿는다. 각종 서적에서 perl 이 쉽다. 다루기 쉽다고 하지만 reference & dereference 관련된 내용은 그리 이해하기도 쉽지 않고 한번에 잘 쓰기도 쉽지 않다. 
나 또한 헷갈리는게 많았고, 나중에 다시 봤을 때 헷갈리지 말자고 정리했다. Perl 을 배우는 많은 이들에게 도움이 됐으면 한다.

