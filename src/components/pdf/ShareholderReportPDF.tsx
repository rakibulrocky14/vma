import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

const P = {
  deepInk: "#0B1120",
  ink: "#0F172A",
  body: "#1E293B",
  muted: "#64748B",
  subtle: "#94A3B8",
  border: "#E2E8F0",
  hairline: "#F1F5F9",
  bgSoft: "#F8FAFC",
  gold: "#C8960C",
  goldStripe: "#D4A017",
  goldBg: "#FFFBEB",
  goldBorder: "#FDE68A",
  green: "#065F46",
  greenBg: "#ECFDF5",
  greenBorder: "#6EE7B7",
  red: "#991B1B",
  redBg: "#FEF2F2",
  redBorder: "#FECACA",
  amber: "#B45309",
  blue: "#1E3A8A",
  blueMid: "#1D4ED8",
  blueBg: "#EFF6FF",
  blueBorder: "#BFDBFE",
  white: "#FFFFFF",
  navyHero: "#0F2952",
};

const S = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 8,
    paddingBottom: 52,
    backgroundColor: P.white,
    color: P.body,
  },

  headerBand: {
    backgroundColor: P.deepInk,
    paddingTop: 18,
    paddingBottom: 16,
    paddingHorizontal: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoTile: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: P.white,
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
  },
  logoImg: { width: "100%", height: "100%", objectFit: "contain" },
  logoBoxText: { color: P.gold, fontFamily: "Helvetica-Bold", fontSize: 22 },
  headerCenter: { flex: 1, alignItems: "center", paddingHorizontal: 12 },
  headerSpacer: { width: 52 },
  reportType: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: P.gold,
    letterSpacing: 2.5,
    marginBottom: 3,
    textAlign: "center",
  },
  reportTitle: {
    fontSize: 21,
    fontFamily: "Helvetica-Bold",
    color: P.white,
    letterSpacing: -0.3,
    textAlign: "center",
  },
  reportPeriod: {
    fontSize: 9,
    color: "#CBD5E1",
    marginTop: 3,
    letterSpacing: 0.5,
    textAlign: "center",
  },

  goldStripe: {
    height: 3,
    backgroundColor: P.goldStripe,
  },

  content: {
    paddingHorizontal: 36,
    paddingTop: 16,
  },

  /* ── PERSON STRIP ── */
  personStrip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: P.border,
    borderStyle: "solid",
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    backgroundColor: P.bgSoft,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: P.navyHero,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: P.gold,
    fontFamily: "Helvetica-Bold",
    fontSize: 16,
  },
  personName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: P.ink,
  },
  personContact: { fontSize: 7.5, color: P.muted, marginTop: 2 },

  /* ── HERO ── */
  hero: {
    backgroundColor: P.navyHero,
    borderRadius: 4,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroLabel: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: "#93C5FD",
    letterSpacing: 1.8,
    marginBottom: 3,
  },
  heroValue: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: P.white,
    letterSpacing: -0.5,
  },
  heroSub: { fontSize: 7.5, color: "#93C5FD", marginTop: 3 },

  /* ── SECTION ── */
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 5,
    marginTop: 4,
  },
  sectionBar: {
    width: 3,
    height: 11,
    backgroundColor: P.gold,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: P.ink,
    letterSpacing: 1.4,
  },
  sectionCount: {
    fontSize: 7,
    color: P.muted,
    marginLeft: "auto",
  },

  /* ── TABLE ── */
  table: {
    borderWidth: 1,
    borderColor: P.border,
    borderStyle: "solid",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  tHead: {
    flexDirection: "row",
    backgroundColor: P.ink,
    paddingVertical: 5,
    paddingHorizontal: 9,
  },
  tHeadCell: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: "#E2E8F0",
    letterSpacing: 1.2,
  },
  tRow: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderBottomWidth: 0.5,
    borderBottomColor: P.hairline,
    borderBottomStyle: "solid",
  },
  tRowAlt: { backgroundColor: P.bgSoft },
  tFoot: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 9,
    backgroundColor: P.goldBg,
    borderTopWidth: 1,
    borderTopColor: P.goldBorder,
    borderTopStyle: "solid",
  },
  bold: { fontFamily: "Helvetica-Bold" },
  italic: { fontFamily: "Helvetica-Oblique" },

  /* ── SUMMARY BOX ── */
  summaryBox: {
    flexDirection: "row",
    gap: 8,
    marginTop: 4,
  },
  summaryTile: {
    flex: 1,
    borderRadius: 4,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderStyle: "solid",
  },
  summaryLabel: {
    fontSize: 5.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.5,
    marginBottom: 3,
  },
  summaryValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    letterSpacing: -0.3,
  },

  /* ── FOOTER ── */
  footer: {
    position: "absolute",
    bottom: 16,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 6,
    borderTopWidth: 0.5,
    borderTopColor: P.border,
    borderTopStyle: "solid",
  },
  footerText: { fontSize: 6.5, color: P.subtle, letterSpacing: 0.4 },
  footerCenter: { fontSize: 6.5, color: P.subtle, letterSpacing: 2 },
});

function qar(n: number) {
  return `QAR ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

interface VillaEntry {
  villaId: string;
  villaNumber: string;
  address: string;
  percentage: number;
  totalCollected: number;
  totalExpenses: number;
  netProfit: number;
  shareholderAmount: number;
}

interface SourceEntry {
  shareId: string;
  sourceName: string;
  propertyName: string;
  sharePercent: number;
  myShareOwnerPercent: number;
  profit: number;
  amount: number;
}

interface ShareholderReportData {
  shareholder: { id: string; name: string; phone: string | null; email: string | null };
  year: number;
  month: number;
  villaEntries: VillaEntry[];
  sourceEntries?: SourceEntry[];
  settings: { companyName: string; logoUrl: string | null; address: string | null };
}

function PageHeader({ data }: { data: ShareholderReportData }) {
  const { settings } = data;
  const initial = settings.companyName.trim().charAt(0).toUpperCase() || "V";
  return (
    <>
      <View style={S.headerBand} fixed>
        <View style={S.logoTile}>
          {settings.logoUrl ? (
            <Image src={settings.logoUrl} style={S.logoImg} />
          ) : (
            <Text style={S.logoBoxText}>{initial}</Text>
          )}
        </View>
        <View style={S.headerCenter}>
          <Text style={S.reportType}>SHAREHOLDER STATEMENT</Text>
          <Text style={S.reportTitle}>{data.shareholder.name}</Text>
          <Text style={S.reportPeriod}>{MONTHS[data.month - 1]} {data.year}</Text>
        </View>
        <View style={S.headerSpacer} />
      </View>
      <View style={S.goldStripe} fixed />
    </>
  );
}

function PageFooter({ companyName }: { companyName: string }) {
  return (
    <View style={S.footer} fixed>
      <Text style={S.footerText}>{companyName}</Text>
      <Text style={S.footerCenter}>CONFIDENTIAL</Text>
      <Text style={S.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  );
}

export function ShareholderReportPDF({ data }: { data: ShareholderReportData }) {
  const { shareholder, villaEntries, settings } = data;
  const sourceEntries = data.sourceEntries ?? [];
  const villaEarnings = villaEntries.reduce((sum, v) => sum + v.shareholderAmount, 0);
  const sourceEarnings = sourceEntries.reduce((sum, s) => sum + s.amount, 0);
  const totalEarnings = villaEarnings + sourceEarnings;
  const totalCollected = villaEntries.reduce((sum, v) => sum + v.totalCollected, 0);
  const totalExpenses = villaEntries.reduce((sum, v) => sum + v.totalExpenses, 0);
  const totalNet = villaEntries.reduce((sum, v) => sum + v.netProfit, 0);
  const totalSourceProfit = sourceEntries.reduce((sum, s) => sum + s.profit, 0);
  const monthLabel = `${MONTHS[data.month - 1]} ${data.year}`;
  const initial = shareholder.name.trim().charAt(0).toUpperCase() || "S";

  return (
    <Document title={`${shareholder.name} — ${monthLabel}`} author={settings.companyName}>
      <Page size="A4" style={S.page}>
        <PageHeader data={data} />

        <View style={S.content}>
          {/* Person strip */}
          <View style={S.personStrip} wrap={false}>
            <View style={S.avatar}>
              <Text style={S.avatarText}>{initial}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={S.personName}>{shareholder.name}</Text>
              <Text style={S.personContact}>
                {[shareholder.phone, shareholder.email].filter(Boolean).join("  ·  ") || "No contact on file"}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontSize: 6, fontFamily: "Helvetica-Bold", color: P.muted, letterSpacing: 1.5 }}>
                STATEMENT PERIOD
              </Text>
              <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: P.ink, marginTop: 3 }}>
                {monthLabel}
              </Text>
            </View>
          </View>

          {/* Hero total earnings */}
          <View style={S.hero} wrap={false}>
            <View>
              <Text style={S.heroLabel}>TOTAL EARNINGS — {monthLabel.toUpperCase()}</Text>
              <Text style={S.heroValue}>{qar(totalEarnings)}</Text>
              <Text style={S.heroSub}>
                {villaEntries.length} villa{villaEntries.length === 1 ? "" : "s"}
                {sourceEntries.length > 0 && ` + ${sourceEntries.length} income source ${sourceEntries.length === 1 ? "share" : "shares"}`}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <View style={{ marginBottom: 4 }}>
                <Text style={{ fontSize: 6, fontFamily: "Helvetica-Bold", color: "#93C5FD", letterSpacing: 1.5 }}>
                  FROM VILLAS
                </Text>
                <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: "#FFFFFF", textAlign: "right" }}>
                  {qar(villaEarnings)}
                </Text>
              </View>
              {sourceEntries.length > 0 && (
                <View>
                  <Text style={{ fontSize: 6, fontFamily: "Helvetica-Bold", color: "#93C5FD", letterSpacing: 1.5 }}>
                    FROM SOURCES
                  </Text>
                  <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: "#FFFFFF", textAlign: "right" }}>
                    {qar(sourceEarnings)}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Properties table */}
          <View style={S.sectionHead}>
            <View style={S.sectionBar} />
            <Text style={S.sectionTitle}>EARNINGS BY PROPERTY</Text>
            <Text style={S.sectionCount}>{villaEntries.length} {villaEntries.length === 1 ? "property" : "properties"}</Text>
          </View>
          <View style={S.table}>
            <View style={S.tHead} fixed>
              <Text style={[S.tHeadCell, { flex: 2 }]}>PROPERTY</Text>
              <Text style={[S.tHeadCell, { flex: 0.8, textAlign: "center" }]}>SHARE</Text>
              <Text style={[S.tHeadCell, { flex: 1.4, textAlign: "right" }]}>COLLECTED</Text>
              <Text style={[S.tHeadCell, { flex: 1.3, textAlign: "right" }]}>EXPENSES</Text>
              <Text style={[S.tHeadCell, { flex: 1.3, textAlign: "right" }]}>NET</Text>
              <Text style={[S.tHeadCell, { flex: 1.5, textAlign: "right" }]}>YOUR CUT</Text>
            </View>
            {villaEntries.length === 0 ? (
              <View style={S.tRow}>
                <Text style={[{ flex: 1, fontSize: 8 }, S.italic, { color: P.subtle }]}>
                  Not assigned to any properties
                </Text>
              </View>
            ) : (
              villaEntries.map((v, i) => (
                <View key={v.villaId} style={[S.tRow, i % 2 === 1 ? S.tRowAlt : {}]} wrap={false}>
                  <View style={{ flex: 2 }}>
                    <Text style={[{ fontSize: 8.5 }, S.bold]}>{v.villaNumber}</Text>
                    <Text style={{ fontSize: 7, color: P.muted, marginTop: 1 }}>{v.address}</Text>
                  </View>
                  <Text style={{ flex: 0.8, fontSize: 8.5, textAlign: "center", color: P.muted }}>
                    {v.percentage}%
                  </Text>
                  <Text style={{ flex: 1.4, fontSize: 8.5, textAlign: "right", color: P.green }}>
                    {qar(v.totalCollected)}
                  </Text>
                  <Text style={{ flex: 1.3, fontSize: 8.5, textAlign: "right", color: P.red }}>
                    {qar(v.totalExpenses)}
                  </Text>
                  <Text style={{ flex: 1.3, fontSize: 8.5, textAlign: "right", color: v.netProfit >= 0 ? P.green : P.red }}>
                    {qar(v.netProfit)}
                  </Text>
                  <Text style={[{ flex: 1.5, fontSize: 8.5, textAlign: "right", color: v.shareholderAmount >= 0 ? P.blueMid : P.red }, S.bold]}>
                    {qar(v.shareholderAmount)}
                  </Text>
                </View>
              ))
            )}
            <View style={S.tFoot} wrap={false}>
              <Text style={[{ flex: 2, fontSize: 8 }, S.bold]}>TOTAL</Text>
              <Text style={{ flex: 0.8 }} />
              <Text style={[{ flex: 1.4, fontSize: 8, textAlign: "right", color: P.green }, S.bold]}>{qar(totalCollected)}</Text>
              <Text style={[{ flex: 1.3, fontSize: 8, textAlign: "right", color: P.red }, S.bold]}>{qar(totalExpenses)}</Text>
              <Text style={[{ flex: 1.3, fontSize: 8, textAlign: "right", color: totalNet >= 0 ? P.green : P.red }, S.bold]}>{qar(totalNet)}</Text>
              <Text style={[{ flex: 1.5, fontSize: 8, textAlign: "right", color: P.blueMid }, S.bold]}>{qar(totalEarnings)}</Text>
            </View>
          </View>

          {/* Summary tiles */}
          {villaEntries.length > 0 && (
            <View style={S.summaryBox} wrap={false}>
              <View style={[S.summaryTile, { borderColor: P.greenBorder, backgroundColor: P.greenBg }]}>
                <Text style={[S.summaryLabel, { color: P.green }]}>TOTAL COLLECTED</Text>
                <Text style={[S.summaryValue, { color: P.green }]}>{qar(totalCollected)}</Text>
              </View>
              <View style={[S.summaryTile, { borderColor: P.border, backgroundColor: P.bgSoft }]}>
                <Text style={[S.summaryLabel, { color: P.muted }]}>TOTAL EXPENSES</Text>
                <Text style={[S.summaryValue, { color: P.red }]}>{qar(totalExpenses)}</Text>
              </View>
              <View style={[S.summaryTile, { borderColor: totalNet >= 0 ? P.greenBorder : P.redBorder, backgroundColor: totalNet >= 0 ? P.greenBg : P.redBg }]}>
                <Text style={[S.summaryLabel, { color: totalNet >= 0 ? P.green : P.red }]}>NET PROFIT</Text>
                <Text style={[S.summaryValue, { color: totalNet >= 0 ? P.green : P.red }]}>{qar(totalNet)}</Text>
              </View>
              <View style={[S.summaryTile, { borderColor: P.blueBorder, backgroundColor: P.blueBg }]}>
                <Text style={[S.summaryLabel, { color: P.blueMid }]}>VILLA EARNINGS</Text>
                <Text style={[S.summaryValue, { color: P.blueMid }]}>{qar(villaEarnings)}</Text>
              </View>
            </View>
          )}

          {/* Income source shares */}
          {sourceEntries.length > 0 && (
            <>
              <View style={[S.sectionHead, { marginTop: 14 }]}>
                <View style={S.sectionBar} />
                <Text style={S.sectionTitle}>EXTERNAL INCOME SHARES</Text>
                <Text style={S.sectionCount}>
                  {sourceEntries.length} {sourceEntries.length === 1 ? "property" : "properties"}
                </Text>
              </View>
              <View style={S.table}>
                <View style={S.tHead} fixed>
                  <Text style={[S.tHeadCell, { flex: 1.5 }]}>SOURCE</Text>
                  <Text style={[S.tHeadCell, { flex: 1.8 }]}>PROPERTY</Text>
                  <Text style={[S.tHeadCell, { flex: 0.8, textAlign: "center" }]}>MY %</Text>
                  <Text style={[S.tHeadCell, { flex: 1.3, textAlign: "right" }]}>PROFIT</Text>
                  <Text style={[S.tHeadCell, { flex: 1.4, textAlign: "right" }]}>MY CUT</Text>
                </View>
                {sourceEntries.map((s, i) => (
                  <View key={s.shareId} style={[S.tRow, i % 2 === 1 ? S.tRowAlt : {}]} wrap={false}>
                    <Text style={[{ flex: 1.5, fontSize: 8.5 }, S.bold]}>{s.sourceName}</Text>
                    <Text style={{ flex: 1.8, fontSize: 8.5 }}>{s.propertyName}</Text>
                    <Text style={{ flex: 0.8, fontSize: 8.5, textAlign: "center", color: P.muted }}>
                      {s.sharePercent.toFixed(2)}%
                    </Text>
                    <Text style={{ flex: 1.3, fontSize: 8.5, textAlign: "right", color: s.profit > 0 ? P.ink : P.subtle }}>
                      {s.profit > 0 ? qar(s.profit) : "—"}
                    </Text>
                    <Text style={[{ flex: 1.4, fontSize: 8.5, textAlign: "right", color: P.blueMid }, S.bold]}>
                      {qar(s.amount)}
                    </Text>
                  </View>
                ))}
                <View style={S.tFoot} wrap={false}>
                  <Text style={[{ flex: 1.5, fontSize: 8 }, S.bold]}>TOTAL</Text>
                  <Text style={{ flex: 1.8 }} />
                  <Text style={{ flex: 0.8 }} />
                  <Text style={[{ flex: 1.3, fontSize: 8, textAlign: "right", color: P.ink }, S.bold]}>
                    {qar(totalSourceProfit)}
                  </Text>
                  <Text style={[{ flex: 1.4, fontSize: 8, textAlign: "right", color: P.blueMid }, S.bold]}>
                    {qar(sourceEarnings)}
                  </Text>
                </View>
              </View>
            </>
          )}
        </View>

        <PageFooter companyName={settings.companyName} />
      </Page>
    </Document>
  );
}
