############################################################################################
#      NSIS Installation Script created by NSIS Quick Setup Script Generator v1.09.18
#               Entirely Edited with NullSoft Scriptable Installation System
#              by Vlasis K. Barkas aka Red Wine red_wine@freemail.gr Sep 2006
############################################################################################

!define APP_NAME "Nodist"
!define COMP_NAME "Nodist"
!define WEB_SITE "https://github.com/nodists/nodist"
!define SHORT_VERSION ";VERSION;"
!define COPYRIGHT "Marcel Klehr © 2015-2023"
!define VERSION "${SHORT_VERSION}.0"
!define DESCRIPTION "Node Version Manager for Windows"
!define LICENSE_TXT "staging\LICENSE.txt"
!define INSTALLER_NAME "NodistSetup-${SHORT_VERSION}.exe"
!define MAIN_APP_EXE "node.exe"
!define INSTALL_TYPE "SetShellVarContext all"
!define REG_ROOT "HKLM"
!define REG_APP_PATH "Software\Microsoft\Windows\CurrentVersion\App Paths\${MAIN_APP_EXE}"
!define UNINSTALL_PATH "Software\Microsoft\Windows\CurrentVersion\Uninstall\${APP_NAME}"
!define PLUGINS_PATH ";PLUGINS_PATH;"

; HKLM (all users) vs HKCU (current user) defines
!define ENV_HKLM 'HKLM "SYSTEM\CurrentControlSet\Control\Session Manager\Environment"'
!define ENV_HKCU 'HKCU "Environment"'

; make some includes
!include "WinMessages.nsh"
!include "x64.nsh"

; add additional plugins
!addplugindir /x86-ansi "${PLUGINS_PATH}\Plugins\x86-ansi"
!addplugindir /x86-ansi "${PLUGINS_PATH}\Plugins\i386-ansi"
!addplugindir /x86-unicode "${PLUGINS_PATH}\Plugins\x86-unicode"
!addplugindir /x86-unicode "${PLUGINS_PATH}\Plugins\i386-unicode"
!addplugindir /amd64-unicode "${PLUGINS_PATH}\Plugins\amd64-unicode"

######################################################################

VIProductVersion  "${VERSION}"
VIAddVersionKey "ProductName"  "${APP_NAME}"
VIAddVersionKey "CompanyName"  "${COMP_NAME}"
VIAddVersionKey "LegalCopyright"  "${COPYRIGHT}"
VIAddVersionKey "FileDescription"  "${DESCRIPTION}"
VIAddVersionKey "FileVersion"  "${VERSION}"

######################################################################

SetCompressor /SOLID Lzma
Name "${APP_NAME}"
Caption "${APP_NAME}"
OutFile "${INSTALLER_NAME}"
BrandingText "${APP_NAME}"
XPStyle on
InstallDirRegKey "${REG_ROOT}" "${REG_APP_PATH}" ""
InstallDir "$PROGRAMFILES\Nodist"

######################################################################

!include "MUI.nsh"

!define MUI_ABORTWARNING
!define MUI_UNABORTWARNING

!insertmacro MUI_PAGE_WELCOME

!ifdef LICENSE_TXT
!insertmacro MUI_PAGE_LICENSE "${LICENSE_TXT}"
!endif

!insertmacro MUI_PAGE_DIRECTORY

!ifdef REG_START_MENU
!define MUI_STARTMENUPAGE_NODISABLE
!define MUI_STARTMENUPAGE_DEFAULTFOLDER "Nodist"
!define MUI_STARTMENUPAGE_REGISTRY_ROOT "${REG_ROOT}"
!define MUI_STARTMENUPAGE_REGISTRY_KEY "${UNINSTALL_PATH}"
!define MUI_STARTMENUPAGE_REGISTRY_VALUENAME "${REG_START_MENU}"
!insertmacro MUI_PAGE_STARTMENU Application $SM_Folder
!endif

!insertmacro MUI_PAGE_INSTFILES

!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM

!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_UNPAGE_FINISH

!insertmacro MUI_LANGUAGE "English"

######################################################################

Section -MainProgram
${INSTALL_TYPE}
SetOverwrite ifnewer
SetOutPath "$INSTDIR"

;ADD_FILES;

; Set Path
EnVar::SetHKLM
EnVar::AddValue "Path" "$INSTDIR\bin"

; Detect x64
${IF} ${RunningX64} 
  WriteRegExpandStr ${ENV_HKLM} NODIST_X64 "1"
${ENDIF}

; set variable
WriteRegExpandStr ${ENV_HKLM} NODIST_PREFIX "$INSTDIR"
WriteRegExpandStr ${ENV_HKLM} NODE_PATH "$INSTDIR\bin\node_modules;%NODE_PATH%"
; make sure windows knows about the change
SendMessage ${HWND_BROADCAST} ${WM_WININICHANGE} 0 "STR:Environment" /TIMEOUT=5000
; change the permssions on the install dir, since everyone needs ot write to it
AccessControl::GrantOnFile "$INSTDIR" "(BU)" "FullAccess"
; set the NPM prefix
push $3
FileOpen $4 "$INSTDIR\.npm-version-global" r
FileRead $4 $3
FileClose $4
Exec '"$INSTDIR\node.exe" "$INSTDIR\npmv\$3\bin\npm-cli.js" config set prefix "$INSTDIR\bin"'
pop $3
; add to git bash if present
push $1
ReadEnvStr $1 USERPROFILE
IfFileExists "$1\.bash_profile" 0 +12
    push $2
    push $3
    FileOpen $2 "$INSTDIR\bin\nodist_bash_profile_content.sh" r
    FileRead $2 $3
    FileClose $2
    FileOpen $2 "$1\.bashrc" a
    FileSeek $2 0 END
    FileWrite $2 "$\n$3"
    FileClose $2
    pop $3
    pop $2
pop $1
SectionEnd

######################################################################

Section -Icons_Reg
SetOutPath "$INSTDIR"
WriteUninstaller "$INSTDIR\uninstall.exe"

!ifdef REG_START_MENU
!insertmacro MUI_STARTMENU_WRITE_BEGIN Application
CreateDirectory "$SMPROGRAMS\$SM_Folder"
CreateShortCut "$SMPROGRAMS\$SM_Folder\${APP_NAME}.lnk" "$INSTDIR\${MAIN_APP_EXE}"
!ifdef WEB_SITE
WriteIniStr "$INSTDIR\${APP_NAME} website.url" "InternetShortcut" "URL" "${WEB_SITE}"
CreateShortCut "$SMPROGRAMS\$SM_Folder\${APP_NAME} Website.lnk" "$INSTDIR\${APP_NAME} website.url"
!endif
!insertmacro MUI_STARTMENU_WRITE_END
!endif

!ifndef REG_START_MENU
CreateDirectory "$SMPROGRAMS\Nodist"
CreateShortCut "$SMPROGRAMS\Nodist\${APP_NAME}.lnk" "$INSTDIR\${MAIN_APP_EXE}"
!ifdef WEB_SITE
WriteIniStr "$INSTDIR\${APP_NAME} website.url" "InternetShortcut" "URL" "${WEB_SITE}"
CreateShortCut "$SMPROGRAMS\Nodist\${APP_NAME} Website.lnk" "$INSTDIR\${APP_NAME} website.url"
!endif
!endif

WriteRegStr ${REG_ROOT} "${REG_APP_PATH}" "" "$INSTDIR\${MAIN_APP_EXE}"
WriteRegStr ${REG_ROOT} "${UNINSTALL_PATH}"  "DisplayName" "${APP_NAME}"
WriteRegStr ${REG_ROOT} "${UNINSTALL_PATH}"  "UninstallString" "$INSTDIR\uninstall.exe"
WriteRegStr ${REG_ROOT} "${UNINSTALL_PATH}"  "DisplayIcon" "$INSTDIR\${MAIN_APP_EXE}"
WriteRegStr ${REG_ROOT} "${UNINSTALL_PATH}"  "DisplayVersion" "${VERSION}"
WriteRegStr ${REG_ROOT} "${UNINSTALL_PATH}"  "Publisher" "${COMP_NAME}"

!ifdef WEB_SITE
WriteRegStr ${REG_ROOT} "${UNINSTALL_PATH}"  "URLInfoAbout" "${WEB_SITE}"
!endif
SectionEnd

######################################################################

Section Uninstall
${INSTALL_TYPE}

; Try to revert .npmrc to previous state.
; We assume prefix wasn't set before installing nodist
ExecWait 'npm config delete prefix'

;DELETE_FILES;

;DELETE_FOLDERS;

; Remove install dir from PATH
EnVar::SetHKLM
EnVar::DeleteValue "PATH" "$INSTDIR\bin"

; delete variables
DeleteRegValue ${ENV_HKLM} NODIST_PREFIX
DeleteRegValue ${ENV_HKLM} NODE_PATH
DeleteRegValue ${ENV_HKLM} NODIST_X64
; make sure windows knows about the change
SendMessage ${HWND_BROADCAST} ${WM_WININICHANGE} 0 "STR:Environment" /TIMEOUT=5000

Delete "$INSTDIR\uninstall.exe"
!ifdef WEB_SITE
Delete "$INSTDIR\${APP_NAME} website.url"
!endif

RmDir "$INSTDIR"

!ifdef REG_START_MENU
!insertmacro MUI_STARTMENU_GETFOLDER "Application" $SM_Folder
Delete "$SMPROGRAMS\$SM_Folder\${APP_NAME}.lnk"
!ifdef WEB_SITE
Delete "$SMPROGRAMS\$SM_Folder\${APP_NAME} Website.lnk"
!endif
RmDir "$SMPROGRAMS\$SM_Folder"
!endif

!ifndef REG_START_MENU
Delete "$SMPROGRAMS\Nodist\${APP_NAME}.lnk"
!ifdef WEB_SITE
Delete "$SMPROGRAMS\Nodist\${APP_NAME} Website.lnk"
!endif
RmDir "$SMPROGRAMS\Nodist"
!endif

DeleteRegKey ${REG_ROOT} "${REG_APP_PATH}"
DeleteRegKey ${REG_ROOT} "${UNINSTALL_PATH}"
SectionEnd
