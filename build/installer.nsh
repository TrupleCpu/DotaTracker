!include "LogicLib.nsh"

!macro customInstall
  UserInfo::GetAccountType
  Pop $R0
  ${If} $R0 != "admin"
    DetailPrint "Not running as administrator. Run installer as admin to auto-install GSI config."
    Goto skip_gsi
  ${EndIf}

  DetailPrint "Looking for Dota 2..."

  SetRegView 64
  ReadRegStr $0 HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\Steam App 570" "InstallLocation"
  ${If} $0 == ""
    SetRegView 32
    ReadRegStr $0 HKLM "SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\Steam App 570" "InstallLocation"
    SetRegView 64
  ${EndIf}

  ${If} $0 == ""
    ReadRegStr $0 HKCU "Software\Valve\Steam" "SteamPath"
    ${If} $0 == ""
      StrCpy $0 "C:\Program Files (x86)\Steam"
    ${EndIf}
    StrCpy $1 "$0\steamapps\common\dota 2 beta\game\dota\cfg"
  ${Else}
    StrCpy $1 "$0\game\dota\cfg"
  ${EndIf}

  ${If} ${FileExists} $1
    StrCpy $2 "$1\gamestate_integration"
    CreateDirectory $2
    SetOutPath $2
    File "${BUILD_RESOURCES_DIR}\gamestate_integration_myserver.cfg"
    SetOutPath $INSTDIR
    DetailPrint "GSI config installed to $2"
  ${Else}
    DetailPrint "Dota 2 not found at $1. Skipping GSI config."
  ${EndIf}

  skip_gsi:
!macroend
