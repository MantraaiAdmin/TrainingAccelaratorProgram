#!/usr/bin/env python3
"""Generate Constel AI NextGen college partnership brochure (PDF)."""

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm, mm
from reportlab.platypus import (
    Image,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
LOGO = ROOT / "docs" / "assets" / "constel-logo.png"
OUTPUT = ROOT / "docs" / "Constel_AI_NextGen_College_Brochure.pdf"

# Brand colors (aligned with logo)
NAVY = colors.HexColor("#0B1A3A")
NAVY_MID = colors.HexColor("#152A52")
CYAN = colors.HexColor("#22D3EE")
CYAN_DARK = colors.HexColor("#0891B2")
SKY = colors.HexColor("#7DD3FC")
WHITE = colors.white
SLATE = colors.HexColor("#334155")
MUTED = colors.HexColor("#64748B")
LIGHT = colors.HexColor("#F1F5F9")
ACCENT_BG = colors.HexColor("#E0F7FA")


def build_styles():
    base = getSampleStyleSheet()
    return {
        "cover_title": ParagraphStyle(
            "CoverTitle",
            parent=base["Title"],
            fontName="Helvetica-Bold",
            fontSize=32,
            leading=38,
            textColor=WHITE,
            alignment=TA_CENTER,
            spaceAfter=8,
        ),
        "cover_sub": ParagraphStyle(
            "CoverSub",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=14,
            leading=20,
            textColor=SKY,
            alignment=TA_CENTER,
            spaceAfter=6,
        ),
        "cover_company": ParagraphStyle(
            "CoverCo",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=11,
            textColor=MUTED,
            alignment=TA_CENTER,
        ),
        "section": ParagraphStyle(
            "Section",
            parent=base["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=20,
            leading=24,
            textColor=NAVY,
            spaceBefore=0,
            spaceAfter=10,
        ),
        "section_light": ParagraphStyle(
            "SectionLight",
            parent=base["Heading1"],
            fontName="Helvetica-Bold",
            fontSize=20,
            leading=24,
            textColor=WHITE,
            spaceBefore=0,
            spaceAfter=10,
        ),
        "subhead": ParagraphStyle(
            "Subhead",
            parent=base["Heading2"],
            fontName="Helvetica-Bold",
            fontSize=13,
            leading=16,
            textColor=CYAN_DARK,
            spaceBefore=8,
            spaceAfter=4,
        ),
        "body": ParagraphStyle(
            "Body",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=10,
            leading=14,
            textColor=SLATE,
            alignment=TA_JUSTIFY,
            spaceAfter=6,
        ),
        "body_light": ParagraphStyle(
            "BodyLight",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=10,
            leading=14,
            textColor=colors.HexColor("#CBD5E1"),
            alignment=TA_JUSTIFY,
            spaceAfter=6,
        ),
        "bullet": ParagraphStyle(
            "Bullet",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=13,
            textColor=SLATE,
            leftIndent=12,
            bulletIndent=0,
            spaceAfter=3,
        ),
        "bullet_light": ParagraphStyle(
            "BulletLight",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=9.5,
            leading=13,
            textColor=colors.HexColor("#E2E8F0"),
            leftIndent=12,
            spaceAfter=3,
        ),
        "track_title": ParagraphStyle(
            "TrackTitle",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=11,
            leading=14,
            textColor=NAVY,
            spaceAfter=2,
        ),
        "track_body": ParagraphStyle(
            "TrackBody",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=9,
            leading=12,
            textColor=SLATE,
            spaceAfter=2,
        ),
        "highlight": ParagraphStyle(
            "Highlight",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=10,
            leading=13,
            textColor=NAVY,
            spaceAfter=4,
        ),
        "cta": ParagraphStyle(
            "CTA",
            parent=base["Normal"],
            fontName="Helvetica-Bold",
            fontSize=12,
            leading=16,
            textColor=CYAN,
            alignment=TA_CENTER,
            spaceAfter=6,
        ),
        "footer": ParagraphStyle(
            "Footer",
            parent=base["Normal"],
            fontName="Helvetica",
            fontSize=8,
            textColor=MUTED,
            alignment=TA_CENTER,
        ),
    }


def accent_bar_table(width):
    return Table([[""]], colWidths=[width], rowHeights=[3 * mm])


def styled_table(data, col_widths, header_rows=1):
    t = Table(data, colWidths=col_widths, repeatRows=header_rows)
    style = [
        ("BACKGROUND", (0, 0), (-1, header_rows - 1), NAVY),
        ("TEXTCOLOR", (0, 0), (-1, header_rows - 1), WHITE),
        ("FONTNAME", (0, 0), (-1, header_rows - 1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("FONTNAME", (0, header_rows), (-1, -1), "Helvetica"),
        ("TEXTCOLOR", (0, header_rows), (-1, -1), SLATE),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.4, colors.HexColor("#CBD5E1")),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
    ]
    for i in range(header_rows, len(data)):
        if i % 2 == 0:
            style.append(("BACKGROUND", (0, i), (-1, i), LIGHT))
    t.setStyle(TableStyle(style))
    return t


def benefit_card(title, desc, width):
    data = [[Paragraph(f"<b>{title}</b>", ParagraphStyle("bc", fontName="Helvetica-Bold", fontSize=10, textColor=NAVY))],
            [Paragraph(desc, ParagraphStyle("bd", fontName="Helvetica", fontSize=8.5, leading=11, textColor=SLATE))]]
    t = Table(data, colWidths=[width])
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), WHITE),
                ("BOX", (0, 0), (-1, -1), 1, CYAN_DARK),
                ("TOPPADDING", (0, 0), (-1, -1), 8),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ("LEFTPADDING", (0, 0), (-1, -1), 10),
                ("RIGHTPADDING", (0, 0), (-1, -1), 10),
            ]
        )
    )
    return t


def on_page_inner(canvas, doc):
    """Header bar on inner pages (2–5)."""
    if doc.page >= 6:
        return
    canvas.saveState()
    canvas.setFillColor(NAVY)
    canvas.rect(0, A4[1] - 12 * mm, A4[0], 12 * mm, fill=1, stroke=0)
    canvas.setFillColor(CYAN)
    canvas.rect(0, A4[1] - 14 * mm, A4[0], 2 * mm, fill=1, stroke=0)
    if LOGO.exists():
        canvas.drawImage(str(LOGO), 12 * mm, A4[1] - 11 * mm, width=8 * mm, height=8 * mm, mask="auto")
    canvas.setFont("Helvetica-Bold", 8)
    canvas.setFillColor(WHITE)
    canvas.drawString(22 * mm, A4[1] - 9 * mm, "Constel AI NextGen")
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(SKY)
    canvas.drawRightString(A4[0] - 12 * mm, A4[1] - 9 * mm, "Constel Global India Pvt. Ltd.")
    canvas.setFont("Helvetica", 7)
    canvas.setFillColor(MUTED)
    canvas.drawCentredString(A4[0] / 2, 8 * mm, f"Page {doc.page}")
    canvas.restoreState()


def cover_block(story, styles):
    """Full-page navy cover using a table (canvas-safe)."""
    inner = []
    inner.append(Spacer(1, 1.8 * cm))
    inner.append(Image(str(LOGO), width=5.5 * cm, height=5.5 * cm))
    inner[-1].hAlign = "CENTER"
    inner.append(Spacer(1, 0.8 * cm))
    inner.append(Paragraph("Constel AI NextGen", styles["cover_title"]))
    inner.append(Paragraph("Industry-Ready Internship Learning Platform", styles["cover_sub"]))
    inner.append(Spacer(1, 0.4 * cm))
    inner.append(
        Paragraph(
            "Industry-driven AI education for tomorrow's innovators.",
            styles["cover_sub"],
        )
    )
    inner.append(Spacer(1, 2.0 * cm))
    inner.append(Paragraph("College Partnership Brochure · 2026", styles["cover_company"]))
    inner.append(Spacer(1, 0.3 * cm))
    inner.append(Paragraph("Constel Global India Pvt. Ltd.", styles["cover_company"]))
    inner.append(Spacer(1, 1.5 * cm))

    t = Table([[inner]], colWidths=[A4[0]])
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), NAVY),
                ("LEFTPADDING", (0, 0), (-1, -1), 0),
                ("RIGHTPADDING", (0, 0), (-1, -1), 0),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    story.append(t)


def back_cover_block(story, styles):
    """Full-page navy back cover."""
    inner = []
    inner.append(Spacer(1, 1.2 * cm))
    inner.append(Image(str(LOGO), width=3.5 * cm, height=3.5 * cm))
    inner[-1].hAlign = "CENTER"
    inner.append(Spacer(1, 0.6 * cm))
    inner.append(Paragraph("Partner With Us This Semester", styles["cover_title"]))
    inner.append(Spacer(1, 0.4 * cm))
    inner.append(
        Paragraph(
            "Launch a pilot cohort with your department. We handle curriculum, platform, "
            "assessments, certificates, hackathon, and paid internship pathways.",
            styles["cover_sub"],
        )
    )
    inner.append(Spacer(1, 0.8 * cm))
    inner.append(Paragraph("<font color='#22D3EE'><b>Next Steps</b></font>", styles["cover_sub"]))
    steps = [
        "30-minute live demo for TPO + HOD",
        "MoU and partnership terms",
        "Bulk student upload (Excel template provided)",
        "Student kickoff webinar",
        "Week-8 completion review + hackathon + internship selection",
    ]
    for i, s in enumerate(steps, 1):
        inner.append(Paragraph(f"{i}. {s}", styles["bullet_light"]))
    inner.append(Spacer(1, 0.8 * cm))
    inner.append(Paragraph("<font color='#22D3EE'><b>Get In Touch</b></font>", styles["cover_sub"]))
    inner.append(
        Paragraph(
            "Praveen Manoharan · praveen.manoharan@constelglobal.com<br/>"
            "+91 8760 8760 62<br/>"
            "Constel Global India Pvt. Ltd.<br/>"
            "https://www.constelglobal.com/",
            styles["cover_sub"],
        )
    )
    inner.append(Spacer(1, 0.8 * cm))
    inner.append(
        Paragraph(
            "Proprietary — Constel Global India Pvt. Ltd.",
            ParagraphStyle("fc2", fontName="Helvetica", fontSize=7, textColor=MUTED, alignment=TA_CENTER),
        )
    )

    t = Table([[inner]], colWidths=[A4[0]])
    t.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), NAVY),
                ("LEFTPADDING", (0, 0), (-1, -1), 1.6 * cm),
                ("RIGHTPADDING", (0, 0), (-1, -1), 1.6 * cm),
                ("TOPPADDING", (0, 0), (-1, -1), 0),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 0),
            ]
        )
    )
    story.append(t)


def build():
    if not LOGO.exists():
        raise FileNotFoundError(f"Logo not found: {LOGO}")

    styles = build_styles()
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)

    doc = SimpleDocTemplate(
        str(OUTPUT),
        pagesize=A4,
        leftMargin=0,
        rightMargin=0,
        topMargin=0,
        bottomMargin=0,
        title="Constel AI NextGen — College Partnership Brochure",
        author="Constel Global India Pvt. Ltd.",
    )

    inner_margin = 1.6 * cm
    W = A4[0] - 2 * inner_margin
    story = []

    # ── PAGE 1: COVER ──────────────────────────────────────────────
    cover_block(story, styles)
    story.append(PageBreak())

    # Inner pages use standard margins via wrapper tables
    def inner_page(flowables):
        t = Table([[flowables]], colWidths=[A4[0]])
        t.setStyle(
            TableStyle(
                [
                    ("LEFTPADDING", (0, 0), (-1, -1), inner_margin),
                    ("RIGHTPADDING", (0, 0), (-1, -1), inner_margin),
                    ("TOPPADDING", (0, 0), (-1, -1), 2.0 * cm),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 1.4 * cm),
                ]
            )
        )
        return t

    # ── PAGE 2: INTRO ─────────────────────────────────────────────
    p2 = []
    p2.append(Paragraph("Transform Your Internship Program", styles["section"]))
    p2.append(
        Paragraph(
            "Constel AI NextGen is a full-stack internship learning and management platform "
            "built exclusively for Indian engineering colleges. We bridge the gap between "
            "theory-heavy classrooms and industry-ready engineers — with measurable outcomes, "
            "verified credentials, and a direct path to paid internships.",
            styles["body"],
        )
    )
    p2.append(Spacer(1, 0.3 * cm))
    p2.append(Paragraph("The Challenge Colleges Face", styles["subhead"]))
    bullets = [
        "Students struggle in TCS, Infosys, and product-company interviews despite good grades",
        "TPOs juggle spreadsheets, WhatsApp groups, and disconnected LMS tools",
        "2nd–4th year students lack Git, Linux, APIs, and real project experience",
        "Faculty cannot personally mentor 500+ students on industry tools",
    ]
    for b in bullets:
        p2.append(Paragraph(f"• {b}", styles["bullet"]))
    p2.append(Spacer(1, 0.3 * cm))
    p2.append(Paragraph("Our Solution", styles["subhead"]))
    p2.append(
        Paragraph(
            "An 8-week intensive internship track (~6 months of engineering depth) with live coding, "
            "weekly assessments, AI tutoring scoped to each lesson, capstone projects, interview "
            "preparation, QR-verified certificates, and a college admin portal for bulk enrollment "
            "and analytics. Not a video library — a job-readiness operating system.",
            styles["body"],
        )
    )
    p2.append(Spacer(1, 0.4 * cm))
    p2.append(
        styled_table(
            [
                ["Audience", "Ideal For", "Cohort Size"],
                ["Students", "2nd–4th year CSE, IT, ECE, AI/ML, MCA", "50–500 / dept / semester"],
                ["College", "TPO, HOD, internship coordinators", "Department-wide rollout"],
                ["Outcome", "Git, APIs, debugging, technical + HR interview readiness", "Placement metrics"],
            ],
            [W * 0.22, W * 0.48, W * 0.30],
        )
    )
    story.append(inner_page(p2))
    story.append(PageBreak())

    # ── PAGE 3: TRACKS ──────────────────────────────────────────────
    p3 = []
    p3.append(Paragraph("Three Master Internship Tracks", styles["section"]))
    p3.append(
        Paragraph(
            "Each track runs 8 weeks with 200+ structured lessons, hands-on labs, weekly 50-question "
            "assessments (80% pass required), interview prep modules, and a capstone project.",
            styles["body"],
        )
    )
    p3.append(Spacer(1, 0.3 * cm))

    tracks = [
        (
            "Track 1 — Python Engineering Foundations",
            "Beginner · 8 Weeks",
            "Linux & terminal · Git & GitHub · Core Python · DSA · OOP · REST APIs · Debugging · Capstone",
            "Backend-ready intern — automation scripts, REST APIs, production debugging, Git workflow",
        ),
        (
            "Track 2 — Full Stack Product Engineering",
            "Intermediate · 8 Weeks",
            "React · Next.js · NestJS · PostgreSQL · Prisma · Docker · DevOps · Real-time systems · Capstone",
            "Junior full-stack engineer — ship features end-to-end from UI to database",
        ),
        (
            "Track 3 — AI Engineering & Intelligent Systems",
            "Advanced · 8 Weeks",
            "LLMs · RAG pipelines · AI agents · FastAPI · Vector DBs · AI UX · Production AI ops · Capstone",
            "AI feature engineer — build assistants, RAG systems, and intelligent workflows",
        ),
    ]
    for title, level, modules, outcome in tracks:
        card_data = [
            [Paragraph(title, styles["track_title"])],
            [Paragraph(f"<font color='#0891B2'><b>{level}</b></font>", styles["track_body"])],
            [Paragraph(f"<b>Modules:</b> {modules}", styles["track_body"])],
            [Paragraph(f"<b>Outcome:</b> {outcome}", styles["track_body"])],
        ]
        t = Table(card_data, colWidths=[W])
        t.setStyle(
            TableStyle(
                [
                    ("BACKGROUND", (0, 0), (-1, -1), LIGHT),
                    ("BOX", (0, 0), (-1, -1), 0.8, CYAN_DARK),
                    ("LEFTPADDING", (0, 0), (-1, -1), 10),
                    ("RIGHTPADDING", (0, 0), (-1, -1), 10),
                    ("TOPPADDING", (0, 0), (-1, -1), 8),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
                ]
            )
        )
        p3.append(t)
        p3.append(Spacer(1, 0.25 * cm))

    p3.append(Spacer(1, 0.2 * cm))
    p3.append(Paragraph("Weekly Learning Rhythm", styles["subhead"]))
    rhythm = [
        "12–15 deep-dive topics with CLI commands, workflow diagrams, and comparison tables",
        "Hands-on labs in browser-based Monaco editor with test cases and AI hints",
        "Weekly live session with students to address queries — recordings shared after each session",
        "Lesson-scoped AI tutor for doubts (disabled during quizzes for integrity)",
        "50-question weekly quiz — MCQ, debugging, output prediction, scenarios",
        "Interview prep — 8 industry Q&A + CLARIFY method + mock dialogue per module",
    ]
    for r in rhythm:
        p3.append(Paragraph(f"• {r}", styles["bullet"]))
    story.append(inner_page(p3))
    story.append(PageBreak())

    # ── PAGE 4: COMPLETION & CAREER OUTCOMES ───────────────────────
    p4 = []
    p4.append(Paragraph("Completion, Credentials & Career Path", styles["section"]))
    p4.append(
        Paragraph(
            "Every student who completes the internship track receives industry-recognized proof of "
            "mastery — and top performers unlock exclusive career opportunities with Constel.",
            styles["body"],
        )
    )
    p4.append(Spacer(1, 0.35 * cm))

    cw = (W - 0.4 * cm) / 2
    p4.append(
        Table(
            [
                [
                    benefit_card(
                        "Internship Course Completion",
                        "Structured 8-week program with weekly quizzes (80% pass), labs, mini-projects, "
                        "interview modules, and capstone submission — plus lifetime access to the platform.",
                        cw,
                    ),
                    benefit_card(
                        "QR-Verified Certificate",
                        "Digital certificate with unique verification ID — shareable on LinkedIn and "
                        "presentable to recruiters as proof of industry-aligned internship completion.",
                        cw,
                    ),
                ],
                [
                    benefit_card(
                        "Internship Letter of Recommendation (LoR)",
                        "Merit-based LoR from Constel Global India Pvt. Ltd. for students who complete "
                        "the track with strong quiz scores, capstone quality, and consistent engagement.",
                        cw,
                    ),
                    benefit_card(
                        "Constel Hackathon",
                        "End-of-program hackathon across partner colleges. Top performers win paid "
                        "internship slots with a performance-based stipend of ₹5,000–10,000/month.",
                        cw,
                    ),
                ],
            ],
            colWidths=[cw + 0.2 * cm, cw + 0.2 * cm],
            rowHeights=[None, None],
        )
    )
    p4.append(Spacer(1, 0.35 * cm))

    # Highlight box for paid internship
    hire_data = [
        [Paragraph("Paid Internship for Top Performers", styles["section_light"])],
        [
            Paragraph(
                "Hackathon winners and leaderboard top performers are <b>directly hired</b> into "
                "Constel's <b>paid internship program</b> with a performance-based stipend of "
                "<b>₹5,000–10,000 per month</b> — real projects, industry mentors, "
                "and a pathway to full-time roles. This is not just learning; it is a talent "
                "pipeline from your campus to our engineering team.",
                styles["body_light"],
            )
        ],
    ]
    hire_table = Table(hire_data, colWidths=[W])
    hire_table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, -1), NAVY),
                ("BOX", (0, 0), (-1, -1), 1.5, CYAN),
                ("LEFTPADDING", (0, 0), (-1, -1), 14),
                ("RIGHTPADDING", (0, 0), (-1, -1), 14),
                ("TOPPADDING", (0, 0), (-1, -1), 12),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 12),
            ]
        )
    )
    p4.append(hire_table)
    p4.append(Spacer(1, 0.4 * cm))
    p4.append(Paragraph("Student Journey at a Glance", styles["subhead"]))
    p4.append(
        Paragraph(
            "<b>Enroll</b> → Pick Track → Weekly Modules → Lessons + Labs → 50-Q Quiz → "
            "Mini Projects → Interview Prep → Capstone → <b>Certificate</b> → "
            "<b>Hackathon</b> → <b>LoR</b> → <b>Paid Internship</b> (₹5,000–10,000/mo stipend, top performers)",
            styles["highlight"],
        )
    )
    story.append(inner_page(p4))
    story.append(PageBreak())

    # ── PAGE 5: PLATFORM + PRICING ──────────────────────────────────
    p5 = []
    p5.append(Paragraph("Platform & Partnership Pricing", styles["section"]))
    p5.append(Paragraph("What Makes Constel Different", styles["subhead"]))
    diff = [
        "Live coding sandbox — run and submit code in browser, not just watch videos",
        "Weekly live mentor sessions — Q&A with students; every session recorded and shared",
        "Lifetime access to the learning application for every enrolled student",
        "AI tutor scoped to current lesson — academic integrity preserved during quizzes",
        "Built-in industry interview prep every week — not an add-on",
        "College admin portal — bulk upload, analytics, department-wise progress",
        "Gamification — XP, levels, streaks, leaderboard for engagement",
    ]
    for d in diff:
        p5.append(Paragraph(f"• {d}", styles["bullet"]))
    p5.append(Spacer(1, 0.35 * cm))
    p5.append(Paragraph("Investment — Per Student", styles["subhead"]))
    p5.append(
        styled_table(
            [
                ["Student Year", "Investment Per Student"],
                ["2nd Year", "₹3,500"],
                ["3rd Year", "₹4,500"],
                ["4th Year", "₹6,999"],
            ],
            [W * 0.45, W * 0.55],
        )
    )
    p5.append(Spacer(1, 0.25 * cm))
    p5.append(
        Paragraph(
            "<i>Includes: full 8-week track, lifetime platform access, live weekly mentor sessions "
            "with recordings, live coding labs, weekly quizzes, interview prep, QR-verified certificate, "
            "hackathon access, LoR eligibility, and paid internship pathway (₹5,000–10,000/mo stipend).</i>",
            styles["body"],
        )
    )
    p5.append(Spacer(1, 0.35 * cm))
    p5.append(Paragraph("Implementation Timeline", styles["subhead"]))
    p5.append(
        styled_table(
            [
                ["Phase", "Duration", "Activity"],
                ["MoU & Setup", "Week 1", "Partnership agreement, college configuration, TPO training"],
                ["Pilot", "Week 2–3", "30–50 students, one track, faculty orientation"],
                ["Scale", "Week 4+", "Full department rollout, bulk student upload"],
                ["Review", "Week 8", "Analytics review, certificates, hackathon, internship shortlist"],
            ],
            [W * 0.22, W * 0.18, W * 0.60],
        )
    )
    story.append(inner_page(p5))
    story.append(PageBreak())

    # ── PAGE 6: BACK COVER / CTA ────────────────────────────────────
    back_cover_block(story, styles)

    def page_callback(canvas, doc):
        if 2 <= doc.page <= 5:
            on_page_inner(canvas, doc)

    doc.build(story, onLaterPages=page_callback)

    print(f"Created: {OUTPUT}")
    print(f"Pages: 6")


if __name__ == "__main__":
    build()
