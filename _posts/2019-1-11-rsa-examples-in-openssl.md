# openssl example

## enc/dec from private.pem/public.pem

```cpp
#include <openssl/evp.h>
#include <openssl/aes.h>
#include <openssl/err.h>
#include <openssl/rand.h>
#include <openssl/rsa.h>
#include <openssl/pem.h>
#include <cstdio>


#define KEY_LENGTH  2048

int rsa(void) {
    char   msg[KEY_LENGTH/8];  // Message to encrypt
    char   *encrypt = NULL;    // Encrypted message
    char   *decrypt = NULL;    // Decrypted message
    char   *err;               // Buffer for any error messages

    // Generate key pair
    printf("Generating RSA (%d bits) keypair...", KEY_LENGTH);
    fflush(stdout);
    FILE* pubfp = fopen("public.pem", "rb");
    FILE* privfp = fopen("private.pem", "rb");
    RSA *rsa_priv, *rsa_priv_read;
    RSA *rsa_pub, *rsa_pub_read;
    rsa_pub = RSA_new();
    rsa_priv = RSA_new();
    rsa_priv_read = PEM_read_RSAPrivateKey(privfp, &rsa_priv,0,0); // 마지막 두 인수는 키 파일에 암호가 걸려있을 경우 사용한다.
    rsa_pub_read = PEM_read_RSA_PUBKEY(pubfp, &rsa_pub,0,0);
    fclose(pubfp);
    fclose(privfp);


    // Get the message to encrypt
    printf("Message to encrypt: ");
    fgets(msg, KEY_LENGTH-1, stdin);
    msg[strlen(msg)-1] = '\0';

    // Encrypt the message
    encrypt = malloc(RSA_size(rsa_pub_read));
    int encrypt_len;
    err = malloc(130);
    if((encrypt_len = RSA_public_encrypt(strlen(msg)+1, (unsigned char*)msg, (unsigned char*)encrypt,
                                         rsa_pub_read, RSA_PKCS1_OAEP_PADDING)) == -1) {
        ERR_load_crypto_strings();
        ERR_error_string(ERR_get_error(), err);
        fprintf(stderr, "Error encrypting message: %s\n", err);
        goto free_stuff;
    }
    // Decrypt it
    decrypt = malloc(encrypt_len);
    if(RSA_private_decrypt(encrypt_len, (unsigned char*)encrypt, (unsigned char*)decrypt,
                           rsa_priv_read, RSA_PKCS1_OAEP_PADDING) == -1) {
        ERR_load_crypto_strings();
        ERR_error_string(ERR_get_error(), err);
        fprintf(stderr, "Error decrypting message: %s\n", err);
        goto free_stuff;
    }
    printf("Decrypted message: %s\n", decrypt);

    free_stuff:
    RSA_free(rsa_pub);
    RSA_free(rsa_priv);
    free(encrypt);
    free(decrypt);
    free(err);

    return 0;
}
```
