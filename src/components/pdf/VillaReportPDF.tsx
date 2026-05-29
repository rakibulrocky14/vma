import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";
import { computeProfit } from "@/lib/calculations";
import { parseDecimal } from "@/lib/currency";

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
  blue: "#1D4ED8",
  white: "#FFFFFF",
};

const S = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 8,
    paddingBottom: 52,
    backgroundColor: P.white,
    color: P.body,
  },

  /* ── HEADER BAND ── */
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

  /* ── GOLD STRIPE ── */
  goldStripe: {
    height: 3,
    backgroundColor: P.goldStripe,
  },

  /* ── CONTENT AREA ── */
  content: {
    paddingHorizontal: 36,
    paddingTop: 16,
  },

  /* ── TWO-COLUMN BODY ── */
  twoCol: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  colLeft: { width: "45%" },
  colRight: { width: "51%" },
  colLeftWide: { width: "54%" },
  colRightNarrow: { width: "42%" },

  /* ── PROPERTY STRIP ── */
  strip: {
    flexDirection: "row",
    alignItems: "stretch",
    backgroundColor: P.bgSoft,
    borderWidth: 1,
    borderColor: P.border,
    borderStyle: "solid",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  stripItem: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  stripDivider: {
    width: 1,
    backgroundColor: P.border,
  },
  stripLabel: {
    fontSize: 5.5,
    fontFamily: "Helvetica-Bold",
    color: P.muted,
    letterSpacing: 1.5,
    marginBottom: 3,
  },
  stripValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: P.ink,
  },
  stripSub: {
    fontSize: 7.5,
    color: P.body,
  },

  /* ── HERO ── */
  heroProfitBand: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: P.greenBg,
    borderLeftWidth: 4,
    borderLeftColor: P.green,
    borderLeftStyle: "solid",
    borderWidth: 1,
    borderColor: P.greenBorder,
    borderStyle: "solid",
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
    gap: 10,
  },
  heroLossBand: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: P.redBg,
    borderLeftWidth: 4,
    borderLeftColor: P.red,
    borderLeftStyle: "solid",
    borderWidth: 1,
    borderColor: P.redBorder,
    borderStyle: "solid",
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 10,
    gap: 10,
  },
  heroLabel: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.8,
  },
  heroValue: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    marginTop: 2,
    letterSpacing: -0.5,
  },
  heroNote: {
    fontSize: 7,
    color: P.muted,
    marginTop: 3,
  },

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
    color: P.muted,
    marginBottom: 3,
  },
  kpiValue: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    letterSpacing: -0.3,
  },

  /* ── SECTION HEADER ── */
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
    paddingVertical: 3,
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
  cell: { flex: 1, fontSize: 8 },
  cellR: { flex: 1, fontSize: 8, textAlign: "right" },
  bold: { fontFamily: "Helvetica-Bold" },
  italic: { fontFamily: "Helvetica-Oblique" },

  /* ── PROFIT BREAKDOWN ── */
  breakdown: {
    borderWidth: 1,
    borderColor: P.border,
    borderStyle: "solid",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
  },
  bRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: P.hairline,
    borderBottomStyle: "solid",
  },
  bLabel: { fontSize: 8, color: P.muted },
  bValue: { fontSize: 8, fontFamily: "Helvetica-Bold", color: P.body },
  bTotalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: P.ink,
  },
  bTotalLabel: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: "#CBD5E1", letterSpacing: 0.6 },
  bTotalValue: { fontSize: 13, fontFamily: "Helvetica-Bold" },

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
  return `QAR ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

interface VillaReportData {
  villaNumber: string;
  address: string;
  year: number;
  month: number;
  rooms: { id: string; roomNumber: string; rentAmount: unknown; paidAmount: unknown; commission?: unknown; status?: "OCCUPIED" | "EMPTY" | "SOLD" | null; carryIn?: number }[];
  expenses: { id: string; description: string; amount: unknown }[];
  shareholders: { shareholder: { id: string; name: string }; percentage: unknown }[];
  settings: { companyName: string; logoUrl: string | null; address: string | null };
}

function PageHeader({ data }: { data: VillaReportData }) {
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
          <Text style={S.reportType}>VILLA REPORT</Text>
          <Text style={S.reportTitle}>{data.villaNumber}</Text>
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

export function VillaReportPDF({ data }: { data: VillaReportData }) {
  const { rooms, expenses, shareholders, settings } = data;

  const showCommission = rooms.some(
    (r) => (r.status ?? "OCCUPIED") === "OCCUPIED" && parseDecimal(r.commission) > 0
  );
  const summary = computeProfit(
    rooms.map((r) => ({ rentAmount: r.rentAmount, paidAmount: r.paidAmount, commission: r.commission, status: r.status, carryIn: r.carryIn })),
    expenses.map((e) => ({ amount: e.amount })),
    shareholders
      .filter((vs) => vs?.shareholder)
      .map((vs) => ({
        id: vs.shareholder.id,
        name: vs.shareholder.name,
        percentage: parseDecimal(vs.percentage),
      }))
  );

  const isProfit = summary.netProfit >= 0;
  const monthLabel = `${MONTHS[data.month - 1]} ${data.year}`;
  const collectionRate = summary.totalRent > 0
    ? ((summary.totalCollected / summary.totalRent) * 100).toFixed(1)
    : "0.0";

  return (
    <Document title={`${data.villaNumber} — ${monthLabel}`} author={settings.companyName}>
      <Page size="A4" style={S.page}>
        <PageHeader data={data} />

        <View style={S.content}>
          {/* Property strip */}
          <View style={S.strip} wrap={false}>
            <View style={S.stripItem}>
              <Text style={S.stripLabel}>PROPERTY</Text>
              <Text style={S.stripValue}>{data.villaNumber}</Text>
            </View>
            <View style={S.stripDivider} />
            <View style={[S.stripItem, { flex: 3 }]}>
              <Text style={S.stripLabel}>ADDRESS</Text>
              <Text style={S.stripSub}>{data.address}</Text>
            </View>
            <View style={S.stripDivider} />
            <View style={S.stripItem}>
              <Text style={S.stripLabel}>ROOMS</Text>
              <Text style={S.stripValue}>{rooms.length}</Text>
            </View>
            <View style={S.stripDivider} />
            <View style={S.stripItem}>
              <Text style={S.stripLabel}>COLLECTION</Text>
              <Text style={[S.stripValue, { color: Number(collectionRate) >= 80 ? P.green : P.amber }]}>
                {collectionRate}%
              </Text>
            </View>
          </View>

          {/* Hero */}
          <View style={isProfit ? S.heroProfitBand : S.heroLossBand} wrap={false}>
            <View style={{ flex: 1 }}>
              <Text style={[S.heroLabel, { color: isProfit ? P.green : P.red }]}>
                {isProfit ? "NET PROFIT" : "NET LOSS"} — {monthLabel.toUpperCase()}
              </Text>
              <Text style={[S.heroValue, { color: isProfit ? P.green : P.red }]}>
                {qar(summary.netProfit)}
              </Text>
              <Text style={S.heroNote}>Realized = collected rent − total expenses</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={[S.heroLabel, { color: P.muted, letterSpacing: 1.2 }]}>PERIOD</Text>
              <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: P.body, marginTop: 3 }}>
                {monthLabel}
              </Text>
            </View>
          </View>

          {/* KPI row */}
          <View style={S.kpiRow} wrap={false}>
            <View style={[S.kpiTile, { borderColor: P.border, backgroundColor: P.bgSoft }]}>
              <Text style={S.kpiLabel}>RENT EXPECTED</Text>
              <Text style={[S.kpiValue, { color: P.ink }]}>{qar(summary.totalRent)}</Text>
            </View>
            <View style={[S.kpiTile, { borderColor: P.greenBorder, backgroundColor: P.greenBg }]}>
              <Text style={[S.kpiLabel, { color: P.green }]}>COLLECTED</Text>
              <Text style={[S.kpiValue, { color: P.green }]}>{qar(summary.totalCollected)}</Text>
            </View>
            <View style={[S.kpiTile, { borderColor: summary.totalDue > 0 ? P.redBorder : P.border, backgroundColor: summary.totalDue > 0 ? P.redBg : P.bgSoft }]}>
              <Text style={[S.kpiLabel, { color: summary.totalDue > 0 ? P.red : P.muted }]}>OUTSTANDING</Text>
              <Text style={[S.kpiValue, { color: summary.totalDue > 0 ? P.red : P.subtle }]}>
                {qar(summary.totalDue)}
              </Text>
            </View>
            <View style={[S.kpiTile, { borderColor: summary.totalExpenses > 0 ? P.redBorder : P.border, backgroundColor: summary.totalExpenses > 0 ? P.redBg : P.bgSoft }]}>
              <Text style={[S.kpiLabel, { color: summary.totalExpenses > 0 ? P.red : P.muted }]}>EXPENSES</Text>
              <Text style={[S.kpiValue, { color: summary.totalExpenses > 0 ? P.red : P.subtle }]}>
                {qar(summary.totalExpenses)}
              </Text>
            </View>
          </View>

          {/* Two-column body — rooms left, summaries right */}
          <View style={S.twoCol}>
            {/* LEFT — rent collection */}
            <View style={showCommission ? S.colLeftWide : S.colLeft}>
              <View style={S.sectionHead}>
                <View style={S.sectionBar} />
                <Text style={S.sectionTitle}>RENT COLLECTION</Text>
                <Text style={S.sectionCount}>{rooms.length}</Text>
              </View>
              <View style={S.table}>
                <View style={S.tHead}>
                  <Text style={[S.tHeadCell, { flex: 1 }]}>ROOM</Text>
                  <Text style={[S.tHeadCell, { flex: 1.4, textAlign: "right" }]}>PAID</Text>
                  {showCommission && (
                    <Text style={[S.tHeadCell, { flex: 1.4, textAlign: "right", color: "#FCD34D" }]}>COMM.</Text>
                  )}
                  <Text style={[S.tHeadCell, { flex: 1.4, textAlign: "right" }]}>DUE</Text>
                </View>
                {rooms.map((r, i) => {
                  const status = r.status ?? "OCCUPIED";
                  if (status !== "OCCUPIED") {
                    // Empty / sold — show the word in the PAID column
                    const wordColor = status === "EMPTY" ? P.amber : P.muted;
                    return (
                      <View key={r.id} style={[S.tRow, i % 2 === 1 ? S.tRowAlt : {}]} wrap={false}>
                        <Text style={[S.cell, S.bold]}>{r.roomNumber}</Text>
                        <Text style={[S.cellR, S.bold, { flex: 1.4, color: wordColor, letterSpacing: 1 }]}>{status}</Text>
                        {showCommission && <Text style={[S.cellR, { flex: 1.4, color: P.subtle }]}>—</Text>}
                        <Text style={[S.cellR, { flex: 1.4, color: P.subtle }]}>—</Text>
                      </View>
                    );
                  }
                  const rent = parseDecimal(r.rentAmount) + (r.carryIn ?? 0);
                  const paid = parseDecimal(r.paidAmount);
                  const commission = parseDecimal(r.commission);
                  const due = rent - paid - commission;
                  return (
                    <View key={r.id} style={[S.tRow, i % 2 === 1 ? S.tRowAlt : {}]} wrap={false}>
                      <Text style={[S.cell, S.bold]}>{r.roomNumber}</Text>
                      <Text style={[S.cellR, { flex: 1.4, color: P.green, fontFamily: "Helvetica-Bold" }]}>{qar(paid)}</Text>
                      {showCommission && (
                        <Text style={[S.cellR, { flex: 1.4, color: commission > 0 ? P.amber : P.subtle }]}>
                          {commission > 0 ? qar(commission) : "—"}
                        </Text>
                      )}
                      <Text style={[S.cellR, { flex: 1.4, color: due > 0 ? P.red : P.subtle, fontFamily: "Helvetica-Bold" }]}>
                        {qar(due)}
                      </Text>
                    </View>
                  );
                })}
                <View style={S.tFoot} wrap={false}>
                  <Text style={[S.cell, S.bold]}>TOTAL</Text>
                  <Text style={[S.cellR, S.bold, { flex: 1.4, color: P.green }]}>{qar(summary.totalCollected)}</Text>
                  {showCommission && (
                    <Text style={[S.cellR, S.bold, { flex: 1.4, color: P.amber }]}>{qar(summary.totalCommission)}</Text>
                  )}
                  <Text style={[S.cellR, S.bold, { flex: 1.4, color: summary.totalDue > 0 ? P.red : P.subtle }]}>
                    {qar(summary.totalDue)}
                  </Text>
                </View>
              </View>
            </View>

            {/* RIGHT — expenses, profit, shareholders */}
            <View style={showCommission ? S.colRightNarrow : S.colRight}>
              {/* Expenses */}
              <View wrap={false}>
                <View style={S.sectionHead}>
                  <View style={S.sectionBar} />
                  <Text style={S.sectionTitle}>EXPENSES</Text>
                  <Text style={S.sectionCount}>{expenses.length}</Text>
                </View>
                <View style={S.table}>
                  <View style={S.tHead}>
                    <Text style={[S.tHeadCell, { flex: 3 }]}>DESCRIPTION</Text>
                    <Text style={[S.tHeadCell, { flex: 1.6, textAlign: "right" }]}>AMOUNT (QAR)</Text>
                  </View>
                  {expenses.length === 0 ? (
                    <View style={S.tRow}>
                      <Text style={[S.cell, S.italic, { color: P.subtle }]}>No expenses this period</Text>
                    </View>
                  ) : (
                    expenses.map((e, i) => (
                      <View key={e.id} style={[S.tRow, i % 2 === 1 ? S.tRowAlt : {}]} wrap={false}>
                        <Text style={{ flex: 3, fontSize: 8 }}>{e.description}</Text>
                        <Text style={[S.cellR, { flex: 1.6, color: P.red, fontFamily: "Helvetica-Bold" }]}>
                          {qar(parseDecimal(e.amount))}
                        </Text>
                      </View>
                    ))
                  )}
                  <View style={S.tFoot}>
                    <Text style={[{ flex: 3, fontSize: 8 }, S.bold]}>TOTAL</Text>
                    <Text style={[S.cellR, S.bold, { flex: 1.6, color: P.red }]}>{qar(summary.totalExpenses)}</Text>
                  </View>
                </View>
              </View>

              {/* Profit breakdown */}
              <View wrap={false}>
                <View style={S.sectionHead}>
                  <View style={S.sectionBar} />
                  <Text style={S.sectionTitle}>PROFIT CALCULATION</Text>
                </View>
                <View style={S.breakdown}>
                  <View style={S.bRow}>
                    <Text style={S.bLabel}>Total rent expected</Text>
                    <Text style={S.bValue}>{qar(summary.totalRent)}</Text>
                  </View>
                  {showCommission && (
                    <View style={S.bRow}>
                      <Text style={S.bLabel}>Less: commission</Text>
                      <Text style={[S.bValue, { color: P.amber }]}>−{qar(summary.totalCommission)}</Text>
                    </View>
                  )}
                  <View style={S.bRow}>
                    <Text style={S.bLabel}>Total collected</Text>
                    <Text style={[S.bValue, { color: P.green }]}>{qar(summary.totalCollected)}</Text>
                  </View>
                  <View style={[S.bRow, { borderBottomWidth: 0 }]}>
                    <Text style={S.bLabel}>Less: total expenses</Text>
                    <Text style={[S.bValue, { color: P.red }]}>−{qar(summary.totalExpenses)}</Text>
                  </View>
                  <View style={S.bTotalRow}>
                    <Text style={S.bTotalLabel}>{isProfit ? "NET PROFIT" : "NET LOSS"}</Text>
                    <Text style={[S.bTotalValue, { color: isProfit ? "#6EE7B7" : "#FCA5A5" }]}>
                      {qar(summary.netProfit)}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Shareholder distribution */}
              {summary.shareholderSplits.length > 0 && (
                <View wrap={false}>
                  <View style={S.sectionHead}>
                    <View style={S.sectionBar} />
                    <Text style={S.sectionTitle}>SHAREHOLDERS</Text>
                    <Text style={S.sectionCount}>{summary.shareholderSplits.length}</Text>
                  </View>
                  <View style={S.table}>
                    <View style={S.tHead}>
                      <Text style={[S.tHeadCell, { flex: 3 }]}>SHAREHOLDER</Text>
                      <Text style={[S.tHeadCell, { flex: 1, textAlign: "center" }]}>%</Text>
                      <Text style={[S.tHeadCell, { flex: 1.8, textAlign: "right" }]}>AMOUNT (QAR)</Text>
                    </View>
                    {summary.shareholderSplits.map((s, i) => (
                      <View key={s.id} style={[S.tRow, i % 2 === 1 ? S.tRowAlt : {}]} wrap={false}>
                        <Text style={[{ flex: 3, fontSize: 8.5 }, S.bold]}>{s.name}</Text>
                        <Text style={{ flex: 1, fontSize: 8.5, textAlign: "center", color: P.muted }}>
                          {s.percentage}%
                        </Text>
                        <Text style={[S.cellR, S.bold, { flex: 1.8, color: s.amount >= 0 ? P.green : P.red, fontSize: 8.5 }]}>
                          {qar(s.amount)}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>

        <PageFooter companyName={settings.companyName} />
      </Page>
    </Document>
  );
}
