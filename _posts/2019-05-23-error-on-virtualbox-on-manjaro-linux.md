# 

```
Kernel driver not installed (rc=-1908)

The VirtualBox Linux kernel driver (vboxdrv) is either not loaded or there is a permission problem with /dev/vboxdrv. Please reinstall the kernel module by executing

'/sbin/rcvboxdrv setup'

as root. If it is available in your distribution, you should install the DKMS package first. This package keeps track of Linux kernel changes and recompiles the vboxdrv kernel module if necessary.

where: suplibOsInit what: 3 VERR_VM_DRIVER_NOT_INSTALLED (-1908) - The support driver is not installed. On linux, open returned ENOENT. 
```

위 에러가 날시 해결방법은 다음과 같다.

uname 하면 `Linux ksoo-pc 4.19.42-1-MANJARO #1 SMP PREEMPT Fri May 10 20:52:43 UTC 2019 x86_64 GNU/Linux` 와 같은 문자가 나온다.

여기서 4.19 에 주목

```
uname -a
sudo pacman -S linux419-virtualbox-host-modules
```

