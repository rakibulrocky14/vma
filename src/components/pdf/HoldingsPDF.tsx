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
  amberBg: "#FFFBEB",
  amberBorder: "#FDE68A",
  emerald: "#047857",
  emeraldBg: "#D1FAE5",
  emeraldBorder: "#6EE7B7",
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

  /* ── OWNER STRIP ── */
  ownerStrip: {
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
  avatarText: { color: P.gold, fontFamily: "Helvetica-Bold", fontSize: 16 },
  ownerName: { fontSize: 12, fontFamily: "Helvetica-Bold", color: P.ink },
  ownerSub: { fontSize: 7.5, color: P.muted, marginTop: 2 },

  /* ── HERO ── */
  hero: {
    backgroundColor: "#7C3A00",
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
    color: "#FDE68A",
    letterSpacing: 1.8,
    marginBottom: 3,
  },
  heroValue: {
    fontSize: 24,
    fontFamily: "Helvetica-Bold",
    color: P.white,
    letterSpacing: -0.5,
  },
  heroSub: { fontSize: 7.5, color: "#FDE68A", marginTop: 3 },

  /* ── KPI TILES ── */
  kpiRow: { flexDirection: "row", gap: 7, marginBottom: 14 },
  kpiTile: {
    flex: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderStyle: "solid",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  kpiLabel: {
    fontSize: 5.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.5,
    marginBottom: 3,
  },
  kpiValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    letterSpacing: -0.3,
  },

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
function pct(n: number) {
  return `${Number(n).toFixed(2)}%`;
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export interface VillaHoldingRow {
  villaId: string;
  villaNumber: string;
  address: string;
  ownerShare: number;
  totalCollected: number;
  totalExpenses: number;
  netProfit: number;
  myAmount: number;
}

export interface SourceEntryRow {
  entryId: string;
  propertyName: string;
  mySharePercent: number;
  totalDistributed: number;
  netMyPercent: number;
  profit: number;
  myCut: number;
  distributedAmount: number;
  myNetAmount: number;
}

export interface SourceHoldingRow {
  sourceId: string;
  sourceName: string;
  sourcePhone: string | null;
  entries: SourceEntryRow[];
}

export interface HoldingsReportData {
  year: number;
  month: number;
  managerName: string;
  villas: VillaHoldingRow[];
  incomeSources: SourceHoldingRow[];
  settings: { companyName: string; logoUrl: string | null; address: string | null };
}

function PageHeader({ data }: { data: HoldingsReportData }) {
  const { settings } = data;
  const initial = settings.companyName.trim().charAt(0).toUpperCase() || "V";
  const monthLabel = `${MONTHS[data.month - 1]} ${data.year}`;
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
          <Text style={S.reportType}>MY HOLDINGS REPORT</Text>
          <Text style={S.reportTitle}>{data.managerName}</Text>
          <Text style={S.reportPeriod}>{monthLabel}</Text>
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

export function HoldingsPDF({ data }: { data: HoldingsReportData }) {
  const { villas, incomeSources, settings } = data;
  const monthLabel = `${MONTHS[data.month - 1]} ${data.year}`;
  const managerInitial = data.managerName.trim().charAt(0).toUpperCase() || "M";

  const totalMyVillaEarnings = villas.reduce((sum, v) => sum + v.myAmount, 0);
  const totalVillaCollected = villas.reduce((sum, v) => sum + v.totalCollected, 0);
  const totalVillaExpenses = villas.reduce((sum, v) => sum + v.totalExpenses, 0);
  const totalVillaNet = villas.reduce((sum, v) => sum + v.netProfit, 0);
  const villasWithShares = villas.filter((v) => v.ownerShare > 0);

  const totalSourceProfit = incomeSources.reduce(
    (sum, s) => sum + s.entries.reduce((es, e) => es + e.profit, 0),
    0
  );
  const totalSourceMyNet = incomeSources.reduce(
    (sum, s) => sum + s.entries.reduce((es, e) => es + e.myNetAmount, 0),
    0
  );
  const grandTotalEarnings = totalMyVillaEarnings + totalSourceMyNet;

  return (
    <Document title={`${data.managerName} — Holdings — ${monthLabel}`} author={settings.companyName}>
      <Page size="A4" style={S.page}>
        <PageHeader data={data} />

        <View style={S.content}>
          {/* Owner strip */}
          <View style={S.ownerStrip} wrap={false}>
            <View style={S.avatar}>
              <Text style={S.avatarText}>{managerInitial}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={S.ownerName}>{data.managerName}</Text>
              <Text style={S.ownerSub}>
                {villas.length} villa{villas.length !== 1 ? "s" : ""}  ·  {incomeSources.length} income source{incomeSources.length !== 1 ? "s" : ""}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontSize: 6, fontFamily: "Helvetica-Bold", color: P.muted, letterSpacing: 1.5 }}>
                REPORT PERIOD
              </Text>
              <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: P.ink, marginTop: 3 }}>
                {monthLabel}
              </Text>
            </View>
          </View>

          {/* Hero — grand total earnings */}
          <View style={S.hero} wrap={false}>
            <View>
              <Text style={S.heroLabel}>TOTAL EARNINGS — {monthLabel.toUpperCase()}</Text>
              <Text style={S.heroValue}>{qar(grandTotalEarnings)}</Text>
              <Text style={S.heroSub}>
                Villas + income sources combined
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <View style={{ marginBottom: 4 }}>
                <Text style={{ fontSize: 6, fontFamily: "Helvetica-Bold", color: "#FDE68A", letterSpacing: 1.5 }}>
                  FROM VILLAS
                </Text>
                <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: "#FFFFFF", textAlign: "right" }}>
                  {qar(totalMyVillaEarnings)}
                </Text>
              </View>
              <View>
                <Text style={{ fontSize: 6, fontFamily: "Helvetica-Bold", color: "#FDE68A", letterSpacing: 1.5 }}>
                  FROM SOURCES
                </Text>
                <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: "#FFFFFF", textAlign: "right" }}>
                  {qar(totalSourceMyNet)}
                </Text>
              </View>
            </View>
          </View>

          {/* KPI row */}
          {villasWithShares.length > 0 && (
            <View style={S.kpiRow} wrap={false}>
              <View style={[S.kpiTile, { borderColor: P.border, backgroundColor: P.bgSoft }]}>
                <Text style={[S.kpiLabel, { color: P.muted }]}>VILLAS MANAGED</Text>
                <Text style={[S.kpiValue, { color: P.ink }]}>{villas.length}</Text>
              </View>
              <View style={[S.kpiTile, { borderColor: P.greenBorder, backgroundColor: P.greenBg }]}>
                <Text style={[S.kpiLabel, { color: P.green }]}>TOTAL COLLECTED</Text>
                <Text style={[S.kpiValue, { color: P.green }]}>{qar(totalVillaCollected)}</Text>
              </View>
              <View style={[S.kpiTile, { borderColor: P.redBorder, backgroundColor: P.redBg }]}>
                <Text style={[S.kpiLabel, { color: P.red }]}>TOTAL EXPENSES</Text>
                <Text style={[S.kpiValue, { color: P.red }]}>{qar(totalVillaExpenses)}</Text>
              </View>
              <View style={[S.kpiTile, { borderColor: P.amberBorder, backgroundColor: P.amberBg }]}>
                <Text style={[S.kpiLabel, { color: P.amber }]}>MY CUT</Text>
                <Text style={[S.kpiValue, { color: P.amber }]}>{qar(totalMyVillaEarnings)}</Text>
              </View>
            </View>
          )}

          {/* Villas table */}
          <View style={S.sectionHead}>
            <View style={S.sectionBar} />
            <Text style={S.sectionTitle}>MY VILLAS</Text>
            <Text style={S.sectionCount}>{villas.length} villa{villas.length !== 1 ? "s" : ""}</Text>
          </View>

          {villas.length === 0 ? (
            <View style={S.table}>
              <View style={S.tRow}>
                <Text style={[{ flex: 1, fontSize: 8 }, S.italic, { color: P.subtle }]}>
                  No villas managed
                </Text>
              </View>
            </View>
          ) : (
            <View style={S.table}>
              <View style={S.tHead} fixed>
                <Text style={[S.tHeadCell, { flex: 2 }]}>VILLA</Text>
                <Text style={[S.tHeadCell, { flex: 0.8, textAlign: "center" }]}>MY SHARE</Text>
                <Text style={[S.tHeadCell, { flex: 1.4, textAlign: "right" }]}>COLLECTED</Text>
                <Text style={[S.tHeadCell, { flex: 1.3, textAlign: "right" }]}>EXPENSES</Text>
                <Text style={[S.tHeadCell, { flex: 1.3, textAlign: "right" }]}>NET</Text>
                <Text style={[S.tHeadCell, { flex: 1.4, textAlign: "right" }]}>MY EARNINGS</Text>
              </View>
              {villas.map((v, i) => (
                <View key={v.villaId} style={[S.tRow, i % 2 === 1 ? S.tRowAlt : {}]} wrap={false}>
                  <View style={{ flex: 2 }}>
                    <Text style={[{ fontSize: 8.5 }, S.bold]}>{v.villaNumber}</Text>
                    <Text style={{ fontSize: 7, color: P.muted, marginTop: 1 }}>{v.address}</Text>
                  </View>
                  <Text style={{ flex: 0.8, fontSize: 8.5, textAlign: "center", color: v.ownerShare > 0 ? P.amber : P.subtle }}>
                    {v.ownerShare > 0 ? pct(v.ownerShare) : "—"}
                  </Text>
                  <Text style={{ flex: 1.4, fontSize: 8.5, textAlign: "right", color: P.green }}>
                    {qar(v.totalCollected)}
                  </Text>
                  <Text style={{ flex: 1.3, fontSize: 8.5, textAlign: "right", color: v.totalExpenses > 0 ? P.red : P.subtle }}>
                    {qar(v.totalExpenses)}
                  </Text>
                  <Text style={{ flex: 1.3, fontSize: 8.5, textAlign: "right", color: v.netProfit >= 0 ? P.green : P.red }}>
                    {qar(v.netProfit)}
                  </Text>
                  <Text style={[{ flex: 1.4, fontSize: 8.5, textAlign: "right", color: v.myAmount > 0 ? P.amber : P.subtle }, S.bold]}>
                    {v.ownerShare > 0 ? qar(v.myAmount) : "—"}
                  </Text>
                </View>
              ))}
              <View style={S.tFoot} wrap={false}>
                <Text style={[{ flex: 2, fontSize: 8 }, S.bold]}>TOTAL</Text>
                <Text style={{ flex: 0.8 }} />
                <Text style={[{ flex: 1.4, fontSize: 8, textAlign: "right", color: P.green }, S.bold]}>{qar(totalVillaCollected)}</Text>
                <Text style={[{ flex: 1.3, fontSize: 8, textAlign: "right", color: P.red }, S.bold]}>{qar(totalVillaExpenses)}</Text>
                <Text style={[{ flex: 1.3, fontSize: 8, textAlign: "right", color: totalVillaNet >= 0 ? P.green : P.red }, S.bold]}>{qar(totalVillaNet)}</Text>
                <Text style={[{ flex: 1.4, fontSize: 8, textAlign: "right", color: P.amber }, S.bold]}>{qar(totalMyVillaEarnings)}</Text>
              </View>
            </View>
          )}

          {/* Income sources */}
          <View style={S.sectionHead}>
            <View style={S.sectionBar} />
            <Text style={S.sectionTitle}>EXTERNAL INCOME SOURCES</Text>
            <Text style={S.sectionCount}>{incomeSources.length} source{incomeSources.length !== 1 ? "s" : ""}</Text>
          </View>

          {incomeSources.length === 0 ? (
            <View style={S.table}>
              <View style={S.tRow}>
                <Text style={[{ flex: 1, fontSize: 8 }, S.italic, { color: P.subtle }]}>
                  No external income sources
                </Text>
              </View>
            </View>
          ) : (
            <View style={S.table}>
              <View style={S.tHead} fixed>
                <Text style={[S.tHeadCell, { flex: 1.5 }]}>SOURCE</Text>
                <Text style={[S.tHeadCell, { flex: 1.8 }]}>PROPERTY</Text>
                <Text style={[S.tHeadCell, { flex: 0.7, textAlign: "center" }]}>MY %</Text>
                <Text style={[S.tHeadCell, { flex: 1.3, textAlign: "right" }]}>PROFIT</Text>
                <Text style={[S.tHeadCell, { flex: 1.3, textAlign: "right" }]}>MY CUT</Text>
                <Text style={[S.tHeadCell, { flex: 1.3, textAlign: "right" }]}>GIVEN AWAY</Text>
                <Text style={[S.tHeadCell, { flex: 1.4, textAlign: "right" }]}>I KEEP</Text>
              </View>
              {incomeSources.flatMap((src) =>
                src.entries.length === 0
                  ? [(
                    <View key={src.sourceId} style={S.tRow}>
                      <Text style={[{ flex: 1.5, fontSize: 8.5 }, S.bold]}>{src.sourceName}</Text>
                      <Text style={[{ flex: 1.8, fontSize: 8 }, S.italic, { color: P.subtle }]}>No properties</Text>
                      <Text style={{ flex: 0.7 }} />
                      <Text style={{ flex: 1.3 }} />
                      <Text style={{ flex: 1.3 }} />
                      <Text style={{ flex: 1.3 }} />
                      <Text style={{ flex: 1.4 }} />
                    </View>
                  )]
                  : src.entries.map((entry, idx) => (
                    <View
                      key={entry.entryId}
                      style={[S.tRow, (idx % 2 === 1) ? S.tRowAlt : {}]}
                      wrap={false}
                    >
                      <Text style={[{ flex: 1.5, fontSize: idx === 0 ? 8.5 : 8 }, idx === 0 ? S.bold : { color: P.subtle }]}>
                        {idx === 0 ? src.sourceName : ""}
                      </Text>
                      <Text style={{ flex: 1.8, fontSize: 8.5 }}>{entry.propertyName}</Text>
                      <Text style={{ flex: 0.7, fontSize: 8, textAlign: "center", color: P.muted }}>
                        {pct(entry.mySharePercent)}
                      </Text>
                      <Text style={{ flex: 1.3, fontSize: 8.5, textAlign: "right", color: entry.profit > 0 ? P.ink : P.subtle }}>
                        {entry.profit > 0 ? qar(entry.profit) : "—"}
                      </Text>
                      <Text style={{ flex: 1.3, fontSize: 8.5, textAlign: "right", color: P.green }}>
                        {qar(entry.myCut)}
                      </Text>
                      <Text style={{ flex: 1.3, fontSize: 8.5, textAlign: "right", color: entry.distributedAmount > 0 ? P.amber : P.subtle }}>
                        {entry.distributedAmount > 0 ? qar(entry.distributedAmount) : "—"}
                      </Text>
                      <Text style={[{ flex: 1.4, fontSize: 8.5, textAlign: "right", color: P.green }, S.bold]}>
                        {qar(entry.myNetAmount)}
                      </Text>
                    </View>
                  ))
              )}
              <View style={S.tFoot} wrap={false}>
                <Text style={[{ flex: 1.5, fontSize: 8 }, S.bold]}>TOTAL</Text>
                <Text style={{ flex: 1.8 }} />
                <Text style={{ flex: 0.7 }} />
                <Text style={[{ flex: 1.3, fontSize: 8, textAlign: "right", color: P.ink }, S.bold]}>{qar(totalSourceProfit)}</Text>
                <Text style={{ flex: 1.3 }} />
                <Text style={{ flex: 1.3 }} />
                <Text style={[{ flex: 1.4, fontSize: 8, textAlign: "right", color: P.green }, S.bold]}>{qar(totalSourceMyNet)}</Text>
              </View>
            </View>
          )}
        </View>

        <PageFooter companyName={settings.companyName} />
      </Page>
    </Document>
  );
}
