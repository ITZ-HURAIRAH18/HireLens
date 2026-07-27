import { Printer } from "lucide-react";
import { Button } from "./ui/button";

const SECTION_HEADINGS = [
  "professional summary", "summary", "profile", "objective", "career objective",
  "work experience", "experience", "professional experience", "employment", "work history",
  "education", "academic background", "academic",
  "technical skills", "skills", "core competencies", "competencies", "key skills",
  "certifications", "certificates", "licenses",
  "projects", "project",
  "languages",
  "interests", "activities", "volunteer",
  "publications", "awards", "honors",
  "contact", "personal information",
];

function detectSections(text) {
  const lines = text.split("\n");
  const sections = [];
  let currentSection = null;
  let currentContent = [];

  for (const line of lines) {
    const trimmed = line.trim();
    const headingMatch = SECTION_HEADINGS.find(
      (h) => trimmed.toLowerCase().replace(/[^a-z\s]/g, "").trim() === h ||
        trimmed.toLowerCase().replace(/[^a-z\s]/g, "").trim().startsWith(h)
    );

    if (headingMatch && (trimmed.length < 60 || trimmed === trimmed.toUpperCase())) {
      if (currentSection) {
        sections.push({ heading: currentSection, content: currentContent.join("\n").trim() });
      }
      currentSection = trimmed;
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }
  if (currentSection) {
    sections.push({ heading: currentSection, content: currentContent.join("\n").trim() });
  }
  return sections;
}

function parseContactLines(text) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  const contact = { name: "", details: [] };
  if (lines.length > 0) contact.name = lines[0];
  contact.details = lines.slice(1).filter(l => !SECTION_HEADINGS.some(h => l.toLowerCase().startsWith(h)));
  return contact;
}

function isLikelyBullet(line) {
  return /^[•\-*]\s/.test(line.trim()) || /^\d+[.)]\s/.test(line.trim());
}

function formatLine(line) {
  const trimmed = line.trim();
  if (!trimmed) return null;
  if (isLikelyBullet(trimmed)) {
    return { type: "bullet", text: trimmed.replace(/^[•\-*]\s*/, "").replace(/^\d+[.)]\s*/, "") };
  }
  if (/^[A-Z][A-Z\s]{2,}$/.test(trimmed) && trimmed.length < 60) {
    return { type: "subheading", text: trimmed };
  }
  if (/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|spring|summer|fall|winter|present|current|\d{4})/i.test(trimmed)) {
    return { type: "date", text: trimmed };
  }
  return { type: "text", text: trimmed };
}

function ResumeContent({ text }) {
  const sections = detectSections(text);
  const contactSection = sections.find(s => /contact|personal/i.test(s.heading));
  const mainSections = sections.filter(s => !/contact|personal/i.test(s.heading));
  const contact = contactSection ? parseContactLines(contactSection.content) : { name: "", details: [] };

  return (
    <div className="resume-page">
      {contact.name && (
        <div className="resume-header">
          <h1 className="resume-name">{contact.name}</h1>
          {contact.details.length > 0 && (
            <div className="resume-contact">
              {contact.details.map((d, i) => (
                <span key={i} className="resume-contact-item">{d}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {mainSections.map((section, idx) => {
        const lines = section.content.split("\n").filter(l => l.trim());
        const isTopSection = idx === 0 && !contact.name;

        return (
          <div key={idx} className="resume-section">
            <h2 className="resume-section-heading">{section.heading}</h2>
            <div className="resume-section-divider" />
            <div className="resume-section-content">
              {isTopSection && lines.length > 0 && !lines[0].trim().match(/^[A-Z\s]{3,}$/) && (
                <div className="resume-name-top">{lines[0].trim()}</div>
              )}
              {lines.map((line, li) => {
                const formatted = formatLine(line);
                if (!formatted) return null;

                switch (formatted.type) {
                  case "bullet":
                    return (
                      <div key={li} className="resume-bullet">
                        <span className="resume-bullet-marker" />
                        <span>{formatted.text}</span>
                      </div>
                    );
                  case "subheading":
                    return <div key={li} className="resume-subheading">{formatted.text}</div>;
                  case "date":
                    return <div key={li} className="resume-date">{formatted.text}</div>;
                  default:
                    return <div key={li} className="resume-text">{formatted.text}</div>;
                }
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function ResumePreviewView({ text }) {
  const handlePrint = () => window.print();

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-end mb-3 print-hidden">
        <Button onClick={handlePrint} variant="secondary" size="sm" className="gap-1.5">
          <Printer className="w-3.5 h-3.5" />
          Print
        </Button>
      </div>
      <div className="resume-preview-container">
        <ResumeContent text={text} />
      </div>
    </div>
  );
}
