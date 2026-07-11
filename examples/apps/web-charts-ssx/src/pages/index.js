import { Chart } from "@inglorious/charts"
import { html } from "@inglorious/web"

// Chart theme (plain CSS) — applies on the server-rendered page and after hydration.
import "@inglorious/charts/base.css"
import "@inglorious/charts/theme.css"

export const Index = {
  render(_, api) {
    return html`
      <style>
        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
          font-family: system-ui, sans-serif;
        }
        section {
          background: white;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #333;
        }
        h2 {
          margin-top: 0;
          color: #555;
        }
        .success {
          background: #d4edda;
          color: #155724;
          padding: 10px;
          border-radius: 4px;
        }
      </style>

      <div class="container">
        <h1>@inglorious/charts + SSX</h1>
        <p>
          Every chart below is rendered to plain SVG on the server (SSG) and
          then hydrated on the client. View source to confirm the
          <code>&lt;svg&gt;</code> markup ships in the initial HTML.
        </p>

        <section>
          <h2>Line Chart (config style)</h2>
          ${api.render("salesLineChart")}
        </section>

        <section>
          <h2>Area Chart (config style)</h2>
          ${api.render("salesAreaChart")}
        </section>

        <section>
          <h2>Bar Chart (config style)</h2>
          ${api.render("salesBarChart")}
        </section>

        <section>
          <h2>Bar Chart (composition style)</h2>
          ${Chart.render(
            {
              entity: "salesBarChart",
              width: 800,
              height: 400,
              children: [
                Chart.CartesianGrid({ strokeDasharray: "3 3" }),
                Chart.XAxis({ dataKey: "label" }),
                Chart.YAxis(),
                Chart.Bar({ dataKey: "value" }),
                Chart.Tooltip(),
              ],
            },
            api,
          )}
        </section>

        <section>
          <h2>Pie Chart (config style)</h2>
          ${api.render("categoryPieChart")}
        </section>

        <section>
          <h2>Donut Chart (config style)</h2>
          ${api.render("categoryDonutChart")}
        </section>

        <section>
          <h2>Verification</h2>
          <div class="success">
            If you can see charts above and the browser console is free of
            hydration warnings, @inglorious/charts is fully compatible with SSX.
          </div>
        </section>
      </div>
    `
  },
}

export const metadata = {
  title: "Charts SSX Demo",
}
