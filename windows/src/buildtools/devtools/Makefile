#
# Devtools Makefile
#

#
# Devtools is used to create PathDefines.mak, so
# it may not be present when we build. So as we 
# don't need it for the build, let's go ahead and
# delete it (Devtools has all dependencies 
# referenced explictly to avoid chicken-and-egg
# here).
#
EXCLUDEPATHDEFINES=1

!include ..\..\Defines.mak

build: dirs
    # build with DCC32 as $DCC32 command uses devtools.exe...
    # $(DCC32) devtools.dpr
!IFDEF DELPHI_STARTER
    start /wait $(MAKEDIR)\bds.exe -ns -b devtools.dpr
!ELSE
    $(MAKEDIR)\dcc32 -Q -B -E. -NSVcl;Vcl.Imaging;Vcl.Touch;Vcl.Samples;Vcl.Shell;System;Xml;Web;Soap;Winapi;System.Win devtools.dpr
!ENDIF
    $(COPY) devtools.exe $(PROGRAM)\buildtools

test-releasebuildcheck: build
    $(PROGRAM)\buildtools\devtools.exe -rt

clean: def-clean

!include ..\..\Target.mak
