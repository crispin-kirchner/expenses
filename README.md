# Einrichtung
## Entwicklungsumgebung
- Chocolatey
- Chocolatey upgrade all task
- GitExtensions
- node.js
- VS Code
- VS Code Extensions
  - GitLens -- Git supercharged
  - IntelliJ IDEA Keybindings
  - Markdown All in One
  - SCSS formatter
  - sort-imports
  - Todo Tree
- CouchDB
- Self-signed Zertifikat erstellen
  - mkcert installieren
  - `mkcert -install`
  - `mkcert -key-file key.pem -cert-file cert.pem laptop-crispin 192.168.178.49 localhost 127.0.0.1 ::1`
    <br/> `laptop-crispin` durch lokalen DNS-Namen oder static (lease) IP ersetzen
  - `mkcert -CAROOT`<br/>Aus diesem Ordner das File `rootCA.pem` auf Telefon und nach `C:\Program Files\Apache CouchDB\etc\certs` kopieren
- Self-signed Zertifikat auf Telefon vertrauen
  - Auf Telefon (Beispiel Android)
    - *Einstellungen* &rarr; *Sicherheit & Standort* &rarr; *Verschlüsselung & Anmeldedaten* &rarr; *Von SD-Karte installieren*
    - Unter *Vertrauenswürdige Anmeldedaten* &rarr; *Nutzer* prüfen ob die neue mkcert CA aufgelistet ist
- CouchDB einrichten
  - `key.pem`, `cert.pem` nach `C:\Program Files\Apache CouchDB\etc\certs` kopieren
  - `http://localhost:5984/_utils` &rarr; *Config*
    - neue Datenbank: expenses-dev
      - Permissions
        - Members &rarr; Roles: _admin entfernen
    - *Config*
      - *Main config*: 4x *Add Option*. *Section*: `ssl`
        - *Name*: `enable`, *Value*: `true`
        - *Name*: `cacert_file`, *Value*: `./etc/certs/rootCA.pem`
        - *Name*: `cert_file`, *Value*: `./etc/certs/cert.pem`
        - *Name*: `key_file`, *Value*: `./etc/certs/key.pem`
      - *CORS* &rarr; *Restrict to specific domains* z.B. `https://laptop-crispin:9767`
  - Config &rarr; CORS &rarr; Restrict to specific domains `http://localhost:3000`, `https://localhost:3000`, `https://localhost:9767`, ...

## Produktivumgebung
- CouchDB
- neue CouchDB erstellen: `expenses-prod`
  - Members &rarr; Roles: _admin entfernen
- `npm run deploy`
- Firewall konfigurieren
  - Start &rarr; Windows Defender Firewall &rarr; Erweiterte Einstellungen &rarr; *Eingehende Regeln* &rarr; *Neue Regel...*
  - Programm: `%ProgramFiles%\Apache CouchDB\erts-9.3.3.14\bin\erl.exe`
  - Profile: *Privat*
  - Protokolltyp: *TCP*
  - Lokaler Port: *6984*

- Autostart einrichten für `%LocalAppData%\Expenses\expenses.vbs` (Verknüpfung in `C:\Users\%USER%\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup` anlegen)

# Entwicklung
## Klon von PROD nach DEV machen
In Fauxton auf *Replication* klicken. Dort diese Einstellungen eingeben:

![](doc/replication-prod-dev.png)

Das ist kein richtiger Dump. Testdaten die nicht auf PROD existieren werden nicht von DEV gelöscht.

# Checkliste Regressionstest
1. Overview aufklappen/zuklappen
2. Monat wechseln
3. Einnahme CHF wiederkehrend bearbeiten
4. Ausgabe CHF wiederkehrend bearbeiten
5. Neue Ausgabe einmalig
6. Neue Ausgabe wiederkehrend
7. Neue Ausgabe einmalig Fremdwährung
8. neue Einnahme
9. Kalender aufmachen
10. Einnahme CHF einmalig bearbeiten
11. Einnahme € wiederkehrend bearbeiten
12. Tag wechseln
13. Ausgabe einmalig CHF bearbeiten
14. Ausgabe einmalig € bearbeiten
15. Diagramm aufmachen
16. Hover testen
17. Tooltips testen
18. Label zu Dimension "Standard" hinzufügen, Farbe wechseln
19. Heute-Knopf klicken
