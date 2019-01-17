loadRSAKey

C++

```cpp
std::shared_ptr<RSA> loadRSAKey(std::string str) {
    BIO* bio = BIO_new_mem_buf( (void*)str.c_str(), -1 ) ; // -1: assume string is null terminated

    BIO_set_flags( bio, BIO_FLAGS_BASE64_NO_NL ) ; // NO NL

    // Load the RSA key from the BIO
    std::shared_ptr<RSA> ret(PEM_read_bio_RSA_PUBKEY( bio, NULL, NULL, NULL ), [](RSA* p) { RSA_free(p); });
    if( !ret.get() )
        printf( "ERROR: Could not load PUBLIC KEY!  PEM_read_bio_RSA_PUBKEY FAILED: %s\n", ERR_error_string( ERR_get_error(), NULL ) ) ;

    BIO_free( bio ) ;
    return ret;
}

    std::shared_ptr<RSA> Bpub = loadRSAKey(
R"(-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxe4noYbzQNBRmVcO6r94yOOQz2fpZxpc
9sNhO22D8A+5cvgoiAix/3vLW3RBjwgicmGLrYgnPiyaz2wScKKXT6JbvK8IYl7BlHb/Mmtlntlv
k7IE9Jjy/4b8hks7h1+mn5NFxjnIUqxMSECpQ9WMSTN20vQFYMGlPep3LnVW8ZNLFrxWqLzoDjf5
KqB+Mpj8dzshygtyIxvzHDDknLHcDHM1CfbSpQJbcFEcR/EsuXEkXzZHlUyDwFIgYq+pJZfsb56S
3fNliGD0gGKYGgU3IIaVZQU5+lQdG6DgUeS/4TFLbsKmdxSORhqFygDQrTAUeeJiGWFDVnWTm58x
4m+aqwIDAQAB
-----END PUBLIC KEY-----)");

```

JAVA

```java
String publicKeyStr = "----BEGIN PUBLIC KEY-----\n" +
                    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu/YEekqDcY/BuOhYSOLx\n" +
                    "3h+FLJWSsASrk9DmRPOF+kOfBwDacNsFqUHIu3lgG4QvZqtuNUw1prnPpADQTSkK\n" +
                    "HMIrAb94SAQIq6zjLNpV0aR0I7jSo0BRL64GHQbNU0r6whBAmrq1Hxwx56ZUj13U\n" +
                    "FjcM2cPg6aj5RTc4TN9vpuDgkTj0JT8gjfT0DRuWtWpGT4mMul+TnbtqNg+p/Ny9\n" +
                    "HbuXrZ/0lq8YqSgI625EoGAuSm5URBqaOw3S8w9tF58RazrLLnsksaeFQanEQ8iG\n" +
                    "UD0UWbSPP3OBE8M+cg+hSPMEdfEMV2p3frXdW0ANWEuepnKuZ4ZtKW5DUQdHouJY\n" +
                    "EQIDAQAB\n" +
                    "-----END PUBLIC KEY-----";
            publicKeyStr = publicKeyStr.replace("----BEGIN PUBLIC KEY-----", "");
            publicKeyStr = publicKeyStr.replace("----END PUBLIC KEY-----", "");
            byte[] encoded = Base64.decode(publicKeyStr, Base64.DEFAULT);
            X509EncodedKeySpec keySpec = new X509EncodedKeySpec(encoded);
            KeyFactory kf = KeyFactory.getInstance("RSA");
            Key publicKey = kf.generatePublic(keySpec);
```
