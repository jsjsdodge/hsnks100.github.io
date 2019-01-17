loadRSAKey

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
