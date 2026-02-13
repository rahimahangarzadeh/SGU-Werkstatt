# SGU-Inspektion Magazin & Werkstatt - PWA

Progressive Web App für Sicherheitsinspektionen bei Janning Group.

## 📋 Dateien

- `index.html` - Hauptseite mit Formular
- `style.css` - Stylesheet (Janning Group Design)
- `script.js` - Hauptlogik, Formular-Handling, Karten-Integration
- `n8n-webhook.js` - n8n Webhook-Integration mit Retry-Logik und Offline-Support
- `service-worker.js` - Service Worker für PWA-Funktionalität
- `manifest.json` - PWA Manifest
- `icon-192.png` - App-Icon (192x192)
- `icon-512.png` - App-Icon (512x512)

## 🚀 Deployment auf GitHub Pages

### Schritt 1: Repository erstellen
1. Gehen Sie zu GitHub und erstellen Sie ein neues Repository
2. Name: z.B. `sgu-inspektion-pwa`
3. Wählen Sie "Public" (für GitHub Pages kostenlos)

### Schritt 2: Dateien hochladen
1. Klicken Sie auf "uploading an existing file"
2. Laden Sie alle 8 Dateien hoch (die 9. Datei `README.md` ist optional)
3. Commit mit Nachricht: "Initial PWA setup"

### Schritt 3: GitHub Pages aktivieren
1. Gehen Sie zu Repository → Settings
2. Scrollen Sie zu "Pages" (linke Seitenleiste)
3. Unter "Source" wählen Sie:
   - Branch: `main` (oder `master`)
   - Folder: `/ (root)`
4. Klicken Sie auf "Save"

### Schritt 4: Zugriff auf die App
Nach 1-2 Minuten ist Ihre App verfügbar unter:
```
https://[IHR-USERNAME].github.io/[REPOSITORY-NAME]/
```

Beispiel: `https://janninggroup.github.io/sgu-inspektion-pwa/`

## 📱 PWA Installation auf dem Handy

### Android (Chrome)
1. Öffnen Sie die Webseite in Chrome
2. Tippen Sie auf das Menü (⋮) → "Zum Startbildschirm hinzufügen"
3. Bestätigen Sie mit "Hinzufügen"
4. Die App erscheint jetzt auf Ihrem Homescreen

### iOS (Safari)
1. Öffnen Sie die Webseite in Safari
2. Tippen Sie auf das Teilen-Symbol (□↑)
3. Scrollen Sie und wählen Sie "Zum Home-Bildschirm"
4. Bestätigen Sie mit "Hinzufügen"

### ⚠️ Wichtig für GitHub Pages:
Die `manifest.json` und `service-worker.js` verwenden **relative Pfade** (`./`), damit die PWA auch funktioniert, wenn sie in einem Unterordner wie `https://username.github.io/repository-name/` liegt.

Wenn die PWA nicht funktioniert:
1. Öffnen Sie die Browser-Konsole (F12)
2. Schauen Sie im "Application" Tab → "Service Workers"
3. Löschen Sie alte Service Worker und Cache
4. Laden Sie die Seite neu (Strg+Shift+R)

## ⚙️ Funktionen

### Tätigkeit: Magazin & Werkstatt
Ein einzelner Button setzt automatisch **alle Fragen auf "i.O."**:
- Alle 17 Checkpunkte werden auf "i.O." markiert
- Begründungsfelder bleiben leer
- Sie können danach jede Antwort manuell ändern

### Karten-Integration
- Standardadresse: **J.-D.-Lauenstein-Str. 24, 49767 Twist**
- Sie können die Adresse manuell im Textfeld ändern
- Oder klicken Sie auf "Karte öffnen" um:
  - Nach einer anderen Adresse zu suchen
  - Direkt auf die Karte zu klicken für einen neuen Standort
- Die Koordinaten werden automatisch gespeichert

### Offline-Unterstützung
- Die App funktioniert auch ohne Internet
- Formulare werden lokal gespeichert
- Automatische Synchronisierung, wenn wieder online

### n8n Integration
- Formulardaten werden an den n8n Webhook gesendet
- Feld `formular_typ: SGUInspektioMagazin` wird automatisch mitgesendet
- Retry-Logik bei Netzwerkfehlern
- Strukturierte Datenformatierung für n8n

## 🔧 Anpassungen

### Webhook-URL ändern
In beiden Dateien `script.js` und `n8n-webhook.js`:
```javascript
const webhookUrl = 'https://n8n.node.janning-it.de/webhook/IHRE-WEBHOOK-ID';
```

### Design anpassen
Alle Farben und Styles sind in `style.css` definiert:
- `--accent: #e8610a` - Orange Akzentfarbe
- `--header-bg: #1a1a18` - Dunkler Header
- etc.

### Weitere Tätigkeiten hinzufügen
In `script.js` im `templates` Objekt:
```javascript
const templates = {
  neue_taetigkeit: {
    name_verantwortlicher: 'Name',
    arbeitgeber: 'Firma',
    firma: ['Firma Name']
  }
};
```

Dann in `index.html` Button hinzufügen:
```html
<button type="button" class="template-btn" data-template="neue_taetigkeit">
  Neue Tätigkeit
</button>
```

## 📊 Datenstruktur für n8n

Die n8n-webhook.js formatiert die Daten strukturiert:

```json
{
  "meta": {
    "formular_typ": "SGUInspektioMagazin",
    "timestamp": "ISO-8601",
    "version": "1.0"
  },
  "allgemeine_angaben": { ... },
  "sicherheit_organisation": { ... },
  "betriebsmittel_umwelt": { ... },
  "massnahmen": [ ... ],
  "statistics": {
    "total_checks": 17,
    "ok_count": 15,
    "nio_count": 2,
    "compliance_rate": "88.24%"
  }
}
```

## 🐛 Fehlerbehebung

### App lädt nicht
- Prüfen Sie, ob alle Dateien hochgeladen wurden
- Warten Sie 2-3 Minuten nach der Aktivierung von GitHub Pages
- Leeren Sie den Browser-Cache

### Formular wird nicht gesendet
- Prüfen Sie die Browser-Konsole (F12)
- Überprüfen Sie die Webhook-URL
- Testen Sie die n8n-Verbindung direkt

### Karte wird nicht angezeigt
- Prüfen Sie die Internet-Verbindung
- OpenStreetMap muss erreichbar sein
- Browser-Konsole für Fehler prüfen

## 📞 Support

Bei Fragen oder Problemen:
- GitHub Issues erstellen
- n8n Workflow prüfen
- Browser-Konsole für Fehler überprüfen

## 📄 Lizenz

© Janning Group - Interne Nutzung
