# Strategy Pattern 

스트래티지 패턴(Strategy pattern)에서는 알고리즘을 구체적으로 정의하지 않고 동작만 제시하고 유연하게 알고리즘의 구체적인 동작을 정의할 수 있게 해준다.

다음 코드를 보자.

```java
public class ScoreProcessing {
    private int min, max ;
    private float average ;
    public void analyze(int[] data) {
        min = max = data[0] ;
        int sum = data[0] ;
        for ( int i = 1 ; i < data.length ; i ++ ) {
            if ( min > data[i] ) min = data[i] ;
            if ( max < data[i] ) max = data[i] ;
            sum += data[i] ;
        }
        average = (float) sum / data.length ;
    }
    public int getMin() { return min; }
    public int getMax() { return max; }
    public float getAverage() { return average; }
} 
```

이 코드는 문제가 있다. analyze 에서 너무 많은 기능을 쓰고 있다. min, max 의 기능을 따로 빼야한다.

별도의 메소드로 min, max 를 빼더라도 문제가 있다. 왜냐면 알고리즘을 바꿀 때 많은 코드 변화를 초래한다.

그래서 Strategy Pattern 을 써야 한다.



```java
import java.util.*;

 interface Statistics {
    public int getMax(int[] data);
    public int getMin(int[] data);
    public float getAverage(int[] data);
}
 class GeneralStatistics
    implements Statistics {
    public int getMax(int[] data) {
        int max = data[0] ;
        for ( int i = 1 ; i < data.length ; i ++ )
            if ( max < data[i] ) max = data[i] ;
        return max ;
    }
    public int getMin(int[] data) {
        int min = data[0] ;
        for ( int i = 1 ; i < data.length ; i ++ )
            if ( min > data[i] ) min = data[i] ;
        return min ;
    }
    public float getAverage(int[] data) {
        int sum = data[0] ;
        for ( int i = 1 ; i < data.length ; i ++ )
            sum += data[i] ;
        float average = (float) sum / data.length ;
        return average ;
    }
}


 class JavaStatistics
    implements Statistics {
    public int getMax(int[] data) {
        int[] copied = Arrays.copyOf(data, data.length) ;
        Arrays.sort(copied) ;
        int max = copied[copied.length-1] ;
        return max ;
    }
    public int getMin(int[] data) {
        int[] copied = Arrays.copyOf(data, data.length) ;
        Arrays.sort(copied) ;
        int min = copied[0] ;
        return min ;
    }
    public float getAverage(int[] data) {
        int sum = getSum(data);
        float average = (float) sum / data.length ;
        return average ;
    }
    private int getSum(int[] data) {
        int sum =0 ;
        for ( int v : data ) sum += v ;
        return sum;
    }
}

class ScoreProcessing {
    private Statistics statistics ;
    private int min, max ;
    private float average ;
    public ScoreProcessing(Statistics statistics){
        this.statistics = statistics;
    }
    public void analyze(int[] data) {
        min = statistics.getMin(data);
        max = statistics.getMax(data);
        average = statistics.getAverage(data);
    }
    public int getMin() { return min; }
    public int getMax() { return max; }
    public float getAverage() { return average; }
}


public class Main {
    public static void main(String[] args) {
        int[] data = {0, 50, 10, 30, 70} ;
        Statistics generalStatistics = new GeneralStatistics();
        ScoreProcessing proc1 = new ScoreProcessing(generalStatistics) ;
        proc1.analyze(data) ;
        System.out.println(proc1.getMin()) ;
        System.out.println(proc1.getMax()) ;
        System.out.println(proc1.getAverage()) ;
        // int[] data = {0, 50, 10, 30, 70} ;
        Statistics javaStatistics = new JavaStatistics() ;
        ScoreProcessing proc2 = new ScoreProcessing(javaStatistics) ;
        proc2.analyze(data) ;
        System.out.println(proc2.getMin()) ;
        System.out.println(proc2.getMax()) ;
        System.out.println(proc2.getAverage()) ;
    }
} 
```

Statistics 인터페이스를 GeneralStatistics, JavaStatistics 가 구현하는 형태다.

Statistics interface 는 min, max 만 정의하고 있지 구체적인 방법은 서술하지 않고 있다. 자세한 알고리즘의 선택은 implements 하는 클래스의 몫으로 남기는 것이다.

그리고 ScoreProcessing 가 Statistics 를 멤버로 가지고 있으면서 추후에 원하는 구현체를 set 하는 방식으로 작성한다.

설명보다 코드를 보는게 나을거라 본다.
