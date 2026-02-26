import fs from "node:fs";

const JSON_PATH = process.env.PUBLICATIONS_JSON ?? "data/publications.json";
const OUT_PATH = process.env.OUT_README ?? "README.md";

const PDF_BASE_URL = process.env.PDF_BASE_URL ?? "https://nik.siposm.hu/publications/";

const data = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"));

const publications = data.publications ?? data ?? [];

function mdLink(label, url) {
    return url ? `[${label}](${url})` : null;
}

function joinAuthors(authors) {
    if (!authors || authors.length === 0) return "";
    return authors
        .map((a) => (a === "Miklós Sipos" ? `\`${a}\`` : a))
        .join(", ");
}

function buildLinks(pub) {
    const links = [];
    const rg = pub.researchgateLink ?? pub.links?.researchgate;
    const ieee = pub.ieeexploreLink ?? pub.links?.ieee;

    links.push(mdLink("ResearchGate", rg));
    links.push(mdLink("IEEE Xplore", ieee));

    if (pub.pdf) {
        const pdfUrl =
            pub.pdf.startsWith("http://") || pub.pdf.startsWith("https://")
                ? pub.pdf
                : `${PDF_BASE_URL}${pub.pdf}`;
        links.push(mdLink("PDF", pdfUrl));
    }

    return links.filter(Boolean).join(" · ");
}

function safe(s) {
    return (s ?? "").toString().trim();
}

const PROFILES_MD = `## Research Profiles

- [ORCID](https://orcid.org/0009-0005-9783-6051)
- [MTMT](https://m2.mtmt.hu/api/author/10083573)
- [ResearchGate](https://www.researchgate.net/profile/Miklos-Sipos)
- [Google Scholar](https://scholar.google.com/citations?user=CJpFBA0AAAAJ&hl=en)
`;

let out = `${PROFILES_MD}\n## Publications\n\n`;

for (let i = 0; i < publications.length; i++) {
    const p = publications[i];

    out += `### 📝 ${safe(p.title)}\n\n`;
    out += `✍️**Authors:** ${joinAuthors(p.authors)}\n\n`;
    out += `🏛️**Venue:** ${safe(p.conference)}\n\n`;
    out += `🔎**Abstract:** ${safe(p.abstract)}\n\n`;

    const links = buildLinks(p);
    out += `🔗**Links:** ${links || "—"}\n\n`;

    if (i !== publications.length - 1) out += `---\n\n`;
}

fs.writeFileSync(OUT_PATH, out, "utf8");
console.log(`Generated ${OUT_PATH} from ${JSON_PATH}`);
