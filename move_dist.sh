#!/bin/bash

mkdir dist-linux dist-mac dist-win > /dev/null 2>&1

mv dist_electron/latest-linux.yml dist_electron/*.AppImage dist_electron/*.tar.gz dist_electron/*.snap dist-linux > /dev/null 2>&1
mv dist_electron/latest-mac.yml dist_electron/*.dmg dist_electron/*.dmg.blockmap dist-mac > /dev/null 2>&1
mv dist_electron/latest.yml dist_electron/*.exe dist_electron/*.exe.blockmap dist-win > /dev/null 2>&1

exit 0