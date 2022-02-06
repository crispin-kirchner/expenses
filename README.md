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
- CouchDB mit Fauxton einrichten:
  - neue Datenbank: expenses-dev
    - Permissions
      - Members -> Roles: _admin entfernen
  - Config -> CORS -> Restrict to specific domains `http://localhost:3000`

## Produktivumgebung
- PHP installieren
- CouchDB
  - Config -> CORS -> Restrict to specific domains `http://localhost:9767`
- neue CouchDB erstellen: `expenses-prod`
  - Members -> Roles: _admin entfernen
- `npm run deploy`
- Autostart einrichten für `%LocalAppData%\Expenses\expenses.vbs` (Verknüpfung in `C:\Users\%USER%\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup` anlegen)

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
