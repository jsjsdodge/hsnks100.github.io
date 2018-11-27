This is multiplication using FFT

```cpp
#include <vector>
#include <complex>
#include <iostream>
using namespace std;

typedef complex<double> base; 
 
void fft(vector<base> &a, bool inv) {
    int n = (int) a.size();
    for (int i = 1, j = 0; i < n; i++) {
        int bit = n >> 1;
        while (!((j ^= bit) & bit)) bit >>= 1;
        if (i < j) swap(a[i], a[j]);
    }
    for (int i = 1; i < n; i <<= 1) {
        double x = inv ? M_PI / i : -M_PI / i;
        base w = {cos(x), sin(x)};
        for (int j = 0; j < n; j += i << 1) {
            base th = {1, 0};
            for (int k = 0; k < i; k++) {
                base tmp = a[i + j + k] * th;
                a[i + j + k] = a[j + k] - tmp;
                a[j + k] += tmp;
                th *= w;
            }
        }
    }
    if (inv) {
        for (int i = 0; i < n; i++) {
            a[i] /= n;
        }
    }
}

void multiply(vector<base> &a, vector<base> &b) {
    int n = (int) max(a.size(), b.size());
    int i = 0;
    while ((1 << i) < (n << 1)) i++;
    n = 1 << i;
    a.resize(n);
    b.resize(n);
    fft(a, false);
    fft(b, false);
    for (int i = 0; i < n; i++) {
        a[i] *= b[i];
    }
    fft(a, true);
}

int main() {
    std::string A = "2485793457934579457945";
    std::string B = "23458934573945793457943579435345";
    //cin >> A >> B;
    if(A == "0" || B == "0") {
        cout << 0 << endl;
        return 0;
    }
    vector<base> a;
    vector<base> b;

    for(int i=A.size()-1; i>=0; i--) {
        a.push_back(base(A[i] - '0', 0));
    }
    for(int i=B.size()-1; i>=0; i--) {
        b.push_back(base(B[i] - '0', 0));
    }
    multiply(a, b);

    vector<int> res(a.size());
    for(int i=0; i<a.size(); i++) {
        res[i] = a[i].real() + 0.5;
    }
    vector<int> ans;
    int carry = 0;
    for(int i=0; i<res.size(); i++) { 
        int g = res[i] + carry;
        int num = g % 10;
        carry = g / 10;
        ans.push_back(num);
    }
    bool startFlag = false;
    for(int i=ans.size()-1; i>=0; i--) { 
        if(ans[i] != 0) {
            startFlag = true; 
        }
        if(startFlag) {
            std::cout << ans[i];
        }
    } 
}
```
