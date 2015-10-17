;--------------------------------
;Include Modern UI

  !include "MUI2.nsh"

;--------------------------------
;General

  !define PRODUCT_NAME "Nodist"
  !define PRODUC_VERSION "0.7.0"
  !define SETUP_NAME "NodistSetup.exe"

  ;Name and file
  Name "${PRODUCT_NAME} ${PRODUCT_VERSION}"
  OutFile ${SETUP_NAME}

  ;Default installation folder
  InstallDir "$PROGRAMFILES\${PRODUCT_NAME}"

  ;Get installation folder from registry if available
  InstallDirRegKey HKCU "Software\${PRODUCT_NAME}" ""

  ;Request application privileges for Windows Vista
  RequestExecutionLevel admin

;--------------------------------
;Interface Settings

  !define MUI_ABORTWARNING

;--------------------------------
;Pages

  !insertmacro MUI_PAGE_WELCOME
  !insertmacro MUI_PAGE_LICENSE "License.md"
  !insertmacro MUI_PAGE_COMPONENTS
  !insertmacro MUI_PAGE_DIRECTORY
  !insertmacro MUI_PAGE_INSTFILES
  !insertmacro MUI_PAGE_FINISH

  !insertmacro MUI_UNPAGE_WELCOME
  !insertmacro MUI_UNPAGE_CONFIRM
  !insertmacro MUI_UNPAGE_INSTFILES
  !insertmacro MUI_UNPAGE_FINISH

;--------------------------------
;Languages

  !insertmacro MUI_LANGUAGE "English"

;--------------------------------
;Installer Sections

Section "Install ${PRODUCT_NAME}" SecInstall

  SetOutPath "$INSTDIR"

  ;ADD YOUR OWN FILES HERE...

  ;Store installation folder
  WriteRegStr HKCU "Software\${PRODUCT_NAME}" "" $INSTDIR

  ;Create uninstaller
  WriteUninstaller "$INSTDIR\Uninstall.exe"

SectionEnd

;--------------------------------
;Descriptions

  ;Language strings
  LangString DESC_SecInstall ${LANG_ENGLISH} "Install ${PRODUCT_NAME}"

  ;Assign language strings to sections
  !insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
    !insertmacro MUI_DESCRIPTION_TEXT ${SecInstall} $(DESC_SecInstall)
  !insertmacro MUI_FUNCTION_DESCRIPTION_END

;--------------------------------
;Uninstaller Section

Section "Uninstall"

  ;ADD YOUR OWN FILES HERE...

  Delete "$INSTDIR\Uninstall.exe"

  RMDir "$INSTDIR"

  DeleteRegKey /ifempty HKCU "Software\${PRODUCT_NAME}"

SectionEnd




ShowInstDetails show
ShowUnInstDetails show

SetCompressor /SOLID lzma
SetCompressorDictSize 12

Section "Configure Nodist"

  SetOutPath "$INSTDIR"

  ;Create uninstaller
  WriteUninstaller "$INSTDIR\Uninstall.exe"

SectionEnd

Section "Add Nodist Bin to Path"

  Push "$INSTDIR\bin"
  Call AddToPath

SectionEnd

Section "Uninstall"

  Delete "$INSTDIR\Uninstall.exe"
  RMDir "$INSTDIR"

SectionEnd

