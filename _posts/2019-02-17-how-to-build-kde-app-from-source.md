Build KDE Frameworks and Applications


# git setting

Add the following text to ~/.gitconfig.

```
[url "git://anongit.kde.org/"]
   insteadOf = kde:
[url "git@git.kde.org:"]
   pushInsteadOf = kde:
```

Reading the CMakeLists.txt of the packages you want to install should help you finding what you really need to install. Or read the error logs.

# arch
```
sudo pacman -Sy --needed phonon-qt5 qt5-webkit qt5-script qt5-svg qt5-tools qt5-x11extras enchant jasper openexr libutempter docbook-xsl shared-mime-info giflib libxss upower udisks2 bzr git doxygen perl-json perl-libwww perl-xml-parser perl-io-socket-ssl akonadi xorg-server-devel libpwquality fontforge eigen libfakekey qca-qt5 xapian-core xsd gperf perl-yaml-syck intltool kdesdk
sudo pacman -S extra-cmake-modules
```
# ubuntu
```
sudo apt build-dep qtbase5-dev
sudo apt install libbz2-dev libxslt-dev libxml2-dev shared-mime-info oxygen-icon-theme libgif-dev libvlc-dev libvlccore-dev doxygen gperf bzr libxapian-dev fontforge libgcrypt20-dev libattr1-dev network-manager-dev libgtk-3-dev xsltproc xserver-xorg-input-synaptics-dev libpwquality-dev modemmanager-dev libxcb-keysyms1-dev libepoxy-dev libpolkit-agent-1-dev libnm-util-dev libnm-glib-dev libegl1-mesa-dev libxcb-xkb-dev libqt5x11extras5-dev libwww-perl libxml-parser-perl libjson-perl libboost-dev libgstreamer-plugins-base1.0-dev libgstreamer1.0-dev libarchive-dev liblmdb-dev cmake git extra-cmake-modules llvm llvm-3.9 libclang-3.9-dev bison flex libudev-dev libqt5svg5-dev libqt5texttospeech5-dev qtbase5-private-dev qttools5-dev libjpeg-dev qtquickcontrols2-5-dev libqrencode-dev
```

# KDE Source Installation

```
 mkdir -p ~/kde/src
 cd ~/kde/src
 git clone kde:kdesrc-build
 cd kdesrc-build
```

Install a symlink of kdesrc-build to a location in PATH:
```
 mkdir ~/bin
 ln -s "$PWD/kdesrc-build" ~/bin
 export PATH=~/bin:$PATH
```

You will need to add your rc like .bashrc, .zshrc.
```
export PATH=~/bin:$PATH
```

# Setup

```
./kdesrc-build-setup
```

If you get a error saying "dialog(1)", then you need to install dialog.

```
sudo apt install dialog
or
sudo pacman -S dialog
```

# Install what you want app.

We try to build text editor named kate. just type following text.

```
kdesrc-build kate
```

# Setup Environment


Copy and use these commands to a new file called ~/kde/.setup-env (or a different name, but you need to adjust the "source" command below to match):

```
export KF5=$HOME/kde/usr
export QTDIR=/usr  
export CMAKE_PREFIX_PATH=$KF5:$CMAKE_PREFIX_PATH  
export XDG_DATA_DIRS=$KF5/share:$XDG_DATA_DIRS:/usr/share  
export XDG_CONFIG_DIRS=$KF5/etc/xdg:$XDG_CONFIG_DIRS:/etc/xdg  
export PATH=$KF5/bin:$QTDIR/bin:$PATH  
export QT_PLUGIN_PATH=$KF5/lib/plugins:$KF5/lib64/plugins:$KF5/lib/x86_64-linux-gnu/plugins:$QTDIR/plugins:$QT_PLUGIN_PATH  
# (lib64 instead of lib on some systems, like openSUSE)
export QML2_IMPORT_PATH=$KF5/lib/qml:$KF5/lib64/qml:$KF5/lib/x86_64-linux-gnu/qml:$QTDIR/qml  
export QML_IMPORT_PATH=$QML2_IMPORT_PATH  
export KDE_SESSION_VERSION=5  
export KDE_FULL_SESSION=true
export SASL_PATH=/usr/lib/sasl2:$KF5/lib/sasl2
# (lib64 instead of lib on some systems, like openSUSE)
PS1="(kdesrc) $PS1"
```



