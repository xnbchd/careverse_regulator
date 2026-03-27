import fs from "node:fs"

const configUrl = new URL("../../../sites/common_site_config.json", import.meta.url)
const commonSiteConfig = JSON.parse(fs.readFileSync(configUrl, "utf-8")) as {
  webserver_port?: number
}
const webserverPort = commonSiteConfig.webserver_port || 8000

export default {
  "^/(app|api|assets|files|private)": {
    target: `http://127.0.0.1:${webserverPort}`,
    ws: true,
    router: function (req: { headers: { host?: string } }) {
      const hostHeader = req.headers.host || "localhost"
      const siteName = hostHeader.split(":")[0]
      return `http://${siteName}:${webserverPort}`
    },
  },
}
