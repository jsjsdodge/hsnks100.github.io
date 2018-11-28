play raw pcm example.

```c
/*
	BASS simple synth
	Copyright (c) 2001-2017 Un4seen Developments Ltd.
*/

#include <gdk/gdkkeysyms.h>
#include <stdlib.h>
#include <string.h>
#include <math.h>
#include <unistd.h>
#include "bass.h"
#include <stdio.h>
BASS_INFO info;
HSTREAM stream;		// the stream 
FILE* fp;
char buf[100000];
DWORD CALLBACK WriteStream(HSTREAM handle, float *buffer, DWORD length, void *user)
{

    printf("!!!!%d \n", length);
    DWORD dd = fread(buffer,1,length, fp);
    return dd;
}



int main(int argc, char* argv[])
{ 
    fp = fopen("441.wav", "rb");

	// check the correct BASS was loaded
	if (HIWORD(BASS_GetVersion())!=BASSVERSION) {
		/*Error("An incorrect version of BASS was loaded");*/
		return 0;
	}

	// initialize default output device
	if (!BASS_Init(-1,44100,0,NULL,NULL)) {
		/*Error("Can't initialize device");*/
		return 0;
	}

	BASS_GetInfo(&info);
	stream=BASS_StreamCreate(info.freq,2,0,(STREAMPROC*)WriteStream,0); // create a stream (stereo for effects)
	BASS_ChannelSetAttribute(stream,BASS_ATTRIB_BUFFER,0); // no buffering for minimum latency
	BASS_ChannelPlay(stream,FALSE); // start it

    for(;;){
        usleep(1000000);
    }
	BASS_Free();

    return 0;
}
```
