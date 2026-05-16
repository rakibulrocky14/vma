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

const palette = {
  ink: "#0f172a",
  body: "#1e293b",
  muted: "#64748b",
  subtle: "#94a3b8",
  border: "#e2e8f0",
  hairline: "#f1f5f9",
  bgSoft: "#f8fafc",
  navy: "#1e3a8a",
  gold: "#b45309",
  goldBg: "#fef3c7",
  green: "#047857",
  greenBg: "#ecfdf5",
  red: "#b91c1c",
  redBg: "#fef2f2",
  amber: "#d97706",
};

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 8,
    paddingTop: 28,
    paddingBottom: 36,
    paddingHorizontal: 32,
    backgroundColor: "#ffffff",
    color: palette.body,
  },

  /* HEADER */
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  logo: { width: 28, height: 28, objectFit: "contain" },
  logoFallback: {
    width: 28,
    height: 28,
    backgroundColor: palette.navy,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  logoFallbackText: { color: "#ffffff", fontFamily: "Helvetica-Bold", fontSize: 12 },
  companyName: { fontSize: 9.5, fontFamily: "Helvetica-Bold", color: palette.ink, letterSpacing: 0.4 },
  companyAddress: { fontSize: 7, color: palette.muted, marginTop: 1 },
  reportMeta: { alignItems: "flex-end" },
  reportKicker: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    color: palette.gold,
    letterSpacing: 1.4,
  },
  reportTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: palette.ink,
    marginTop: 1,
  },
  reportPeriod: {
    fontSize: 8,
    color: palette.muted,
    marginTop: 0,
  },
  divider: {
    height: 1.5,
    backgroundColor: palette.ink,
    marginTop: 8,
    marginBottom: 10,
  },
  dividerAccent: {
    height: 1.5,
    width: 44,
    backgroundColor: palette.gold,
    marginTop: -1.5,
    marginBottom: 10,
  },

  /* PROPERTY STRIP */
  propertyStrip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: palette.bgSoft,
    borderRadius: 3,
    marginBottom: 10,
    gap: 12,
  },
  propLabel: {
    fontSize: 6,
    fontFamily: "Helvetica-Bold",
    color: palette.muted,
    letterSpacing: 1.2,
  },
  propValue: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: palette.ink,
    marginTop: 1,
  },
  propMeta: {
    fontSize: 7.5,
    color: palette.muted,
    marginTop: 1,
  },
  propDivider: { width: 1, height: 22, backgroundColor: palette.border },

  /* HERO KPI */
  heroProfit: {
    backgroundColor: palette.greenBg,
    borderLeftWidth: 3,
    borderLeftColor: palette.green,
    borderLeftStyle: "solid",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  heroLoss: {
    backgroundColor: palette.redBg,
    borderLeftWidth: 3,
    borderLeftColor: palette.red,
    borderLeftStyle: "solid",
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  heroLabel: {
    fontSize: 6.5,
    fontFamily: "Helvetica-Bold",
    letterSpacing: 1.4,
  },
  heroValue: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    marginTop: 2,
  },
  heroSub: { fontSize: 7, color: palette.muted, marginTop: 1 },

  /* KPI TILES */
  kpiRow: { flexDirection: "row", gap: 6, marginBottom: 12 },
  kpiTile: {
    flex: 1,
    borderWidth: 1,
    borderColor: palette.border,
    borderStyle: "solid",
    borderRadius: 3,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  kpiLabel: {
    fontSize: 6,
    fontFamily: "Helvetica-Bold",
    color: palette.muted,
    letterSpacing: 1.2,
  },
  kpiValue: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: palette.ink,
    marginTop: 2,
  },

  /* SECTION HEADER */
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 2,
    marginBottom: 4,
  },
  sectionBar: { width: 2.5, height: 10, backgroundColor: palette.gold },
  sectionTitle: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: palette.ink,
    letterSpacing: 1.2,
  },
  sectionCount: {
    fontSize: 7,
    color: palette.muted,
    marginLeft: "auto",
  },

  /* TABLE */
  table: {
    borderWidth: 1,
    borderColor: palette.border,
    borderStyle: "solid",
    borderRadius: 3,
    overflow: "hidden",
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: palette.ink,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  tableHeaderCell: {
    fontFamily: "Helvetica-Bold",
    fontSize: 6.5,
    color: "#ffffff",
    letterSpacing: 1,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 2.5,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: palette.hairline,
    borderBottomStyle: "solid",
  },
  tableRowAlt: { backgroundColor: palette.bgSoft },
  tableFooter: {
    flexDirection: "row",
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: palette.goldBg,
    borderTopWidth: 1,
    borderTopColor: palette.border,
    borderTopStyle: "solid",
  },
  cell: { flex: 1, fontSize: 8 },
  cellRight: { flex: 1, textAlign: "right", fontSize: 8 },
  bold: { fontFamily: "Helvetica-Bold" },
  mono: { fontFamily: "Helvetica" },

  /* PROFIT BREAKDOWN */
  breakdown: {
    borderWidth: 1,
    borderColor: palette.border,
    borderStyle: "solid",
    borderRadius: 3,
    padding: 10,
    marginBottom: 10,
  },
  breakdownRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: palette.hairline,
    borderBottomStyle: "solid",
  },
  breakdownLast: { borderBottomWidth: 0 },
  breakdownLabel: { fontSize: 8, color: palette.muted },
  breakdownValue: { fontSize: 8, fontFamily: "Helvetica-Bold", color: palette.body },
  breakdownTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    marginTop: 3,
    borderTopWidth: 1.5,
    borderTopColor: palette.ink,
    borderTopStyle: "solid",
  },

  /* FOOTER */
  footer: {
    position: "absolute",
    bottom: 16,
    left: 32,
    right: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 5,
    borderTopWidth: 0.5,
    borderTopColor: palette.border,
    borderTopStyle: "solid",
  },
  footerText: { fontSize: 6.5, color: palette.subtle, letterSpacing: 0.4 },
  footerCenter: { fontSize: 6.5, color: palette.subtle, letterSpacing: 1.6 },
});

function qar(n: number) {
  return `QAR ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

interface VillaReportData {
  villaNumber: string;
  address: string;
  year: number;
  month: number;
  rooms: { id: string; roomNumber: string; rentAmount: unknown; paidAmount: unknown }[];
  expenses: { id: string; description: string; amount: unknown }[];
  shareholders: { shareholder: { id: string; name: string }; percentage: unknown }[];
  settings: { companyName: string; logoUrl: string | null; address: string | null };
}

function Header({ data }: { data: VillaReportData }) {
  const { settings } = data;
  const initial = settings.companyName.trim().charAt(0).toUpperCase() || "V";
  return (
    <View style={styles.header} fixed>
      <View style={styles.brand}>
        {settings.logoUrl ? (
          <Image src={settings.logoUrl} style={styles.logo} />
        ) : (
          <View style={styles.logoFallback}>
            <Text style={styles.logoFallbackText}>{initial}</Text>
          </View>
        )}
        <View>
          <Text style={styles.companyName}>{settings.companyName.toUpperCase()}</Text>
          {settings.address && <Text style={styles.companyAddress}>{settings.address}</Text>}
        </View>
      </View>
      <View style={styles.reportMeta}>
        <Text style={styles.reportKicker}>VILLA REPORT</Text>
        <Text style={styles.reportTitle}>{data.villaNumber}</Text>
        <Text style={styles.reportPeriod}>{MONTHS[data.month - 1]} {data.year}</Text>
      </View>
    </View>
  );
}

function Footer({ companyName }: { companyName: string }) {
  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>{companyName}</Text>
      <Text style={styles.footerCenter}>CONFIDENTIAL</Text>
      <Text
        style={styles.footerText}
        render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
      />
    </View>
  );
}

export function VillaReportPDF({ data }: { data: VillaReportData }) {
  const { rooms, expenses, shareholders, settings } = data;

  const summary = computeProfit(
    rooms.map((r) => ({ rentAmount: r.rentAmount, paidAmount: r.paidAmount })),
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
  const collectionRate =
    summary.totalRent > 0 ? Math.round((summary.totalCollected / summary.totalRent) * 100) : 0;

  return (
    <Document
      title={`${data.villaNumber} — ${monthLabel}`}
      author={settings.companyName}
    >
      <Page size="A4" style={styles.page}>
        <Header data={data} />
        <View style={styles.divider} />
        <View style={styles.dividerAccent} />

        {/* PROPERTY STRIP */}
        <View style={styles.propertyStrip} wrap={false}>
          <View>
            <Text style={styles.propLabel}>PROPERTY</Text>
            <Text style={styles.propValue}>{data.villaNumber}</Text>
          </View>
          <View style={styles.propDivider} />
          <View>
            <Text style={styles.propLabel}>ADDRESS</Text>
            <Text style={styles.propMeta}>{data.address}</Text>
          </View>
          <View style={styles.propDivider} />
          <View>
            <Text style={styles.propLabel}>ROOMS</Text>
            <Text style={styles.propMeta}>{rooms.length} rooms</Text>
          </View>
          <View style={styles.propDivider} />
          <View>
            <Text style={styles.propLabel}>COLLECTION</Text>
            <Text style={styles.propMeta}>{collectionRate}%</Text>
          </View>
        </View>

        {/* HERO KPI */}
        <View style={isProfit ? styles.heroProfit : styles.heroLoss} wrap={false}>
          <Text
            style={[
              styles.heroLabel,
              { color: isProfit ? palette.green : palette.red },
            ]}
          >
            {isProfit ? "NET PROFIT" : "NET LOSS"} — {monthLabel.toUpperCase()}
          </Text>
          <Text
            style={[
              styles.heroValue,
              { color: isProfit ? palette.green : palette.red },
            ]}
          >
            {qar(summary.netProfit)}
          </Text>
          <Text style={styles.heroSub}>
            Realized profit = collected rent − total expenses
          </Text>
        </View>

        {/* KPI TILES */}
        <View style={styles.kpiRow} wrap={false}>
          <View style={styles.kpiTile}>
            <Text style={styles.kpiLabel}>RENT EXPECTED</Text>
            <Text style={styles.kpiValue}>{qar(summary.totalRent)}</Text>
          </View>
          <View style={styles.kpiTile}>
            <Text style={styles.kpiLabel}>COLLECTED</Text>
            <Text style={[styles.kpiValue, { color: palette.green }]}>{qar(summary.totalCollected)}</Text>
          </View>
          <View style={styles.kpiTile}>
            <Text style={styles.kpiLabel}>OUTSTANDING</Text>
            <Text
              style={[
                styles.kpiValue,
                { color: summary.totalDue > 0 ? palette.amber : palette.subtle },
              ]}
            >
              {qar(summary.totalDue)}
            </Text>
          </View>
          <View style={styles.kpiTile}>
            <Text style={styles.kpiLabel}>EXPENSES</Text>
            <Text style={[styles.kpiValue, { color: palette.red }]}>{qar(summary.totalExpenses)}</Text>
          </View>
        </View>

        {/* ROOMS TABLE — rows can wrap to next page individually */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionBar} />
          <Text style={styles.sectionTitle}>RENT COLLECTION</Text>
          <Text style={styles.sectionCount}>{rooms.length} room{rooms.length === 1 ? "" : "s"}</Text>
        </View>
        <View style={styles.table}>
          <View style={styles.tableHeader} fixed>
            <Text style={[styles.tableHeaderCell, { flex: 1 }]}>ROOM</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1.2, textAlign: "right" }]}>RENT</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1.2, textAlign: "right" }]}>PAID</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1.2, textAlign: "right" }]}>DUE</Text>
          </View>
          {rooms.map((r, i) => {
            const rent = parseDecimal(r.rentAmount);
            const paid = parseDecimal(r.paidAmount);
            const due = rent - paid;
            return (
              <View
                key={r.id}
                style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
                wrap={false}
              >
                <Text style={[styles.cell, styles.bold]}>{r.roomNumber}</Text>
                <Text style={styles.cellRight}>{qar(rent)}</Text>
                <Text style={[styles.cellRight, { color: palette.green }]}>{qar(paid)}</Text>
                <Text
                  style={[
                    styles.cellRight,
                    { color: due > 0 ? palette.red : palette.subtle, fontFamily: "Helvetica-Bold" },
                  ]}
                >
                  {qar(due)}
                </Text>
              </View>
            );
          })}
          <View style={styles.tableFooter} wrap={false}>
            <Text style={[styles.cell, styles.bold]}>TOTAL</Text>
            <Text style={[styles.cellRight, styles.bold]}>{qar(summary.totalRent)}</Text>
            <Text style={[styles.cellRight, styles.bold, { color: palette.green }]}>
              {qar(summary.totalCollected)}
            </Text>
            <Text
              style={[
                styles.cellRight,
                styles.bold,
                { color: summary.totalDue > 0 ? palette.red : palette.subtle },
              ]}
            >
              {qar(summary.totalDue)}
            </Text>
          </View>
        </View>

        {/* EXPENSES — keep entire block together on one page */}
        <View wrap={false}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionBar} />
            <Text style={styles.sectionTitle}>EXPENSES</Text>
            <Text style={styles.sectionCount}>
              {expenses.length} {expenses.length === 1 ? "entry" : "entries"}
            </Text>
          </View>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 4 }]}>DESCRIPTION</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1.4, textAlign: "right" }]}>AMOUNT</Text>
            </View>
            {expenses.length === 0 ? (
              <View style={styles.tableRow}>
                <Text style={{ flex: 1, fontSize: 9, color: palette.subtle, fontStyle: "italic" }}>
                  No expenses recorded for this period
                </Text>
              </View>
            ) : (
              expenses.map((e, i) => (
                <View
                  key={e.id}
                  style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
                >
                  <Text style={{ flex: 4, fontSize: 9 }}>{e.description}</Text>
                  <Text
                    style={[
                      styles.cellRight,
                      { flex: 1.4, color: palette.red, fontFamily: "Helvetica-Bold" },
                    ]}
                  >
                    {qar(parseDecimal(e.amount))}
                  </Text>
                </View>
              ))
            )}
            <View style={styles.tableFooter}>
              <Text style={[{ flex: 4, fontSize: 9 }, styles.bold]}>TOTAL EXPENSES</Text>
              <Text
                style={[
                  styles.cellRight,
                  styles.bold,
                  { flex: 1.4, color: palette.red },
                ]}
              >
                {qar(summary.totalExpenses)}
              </Text>
            </View>
          </View>
        </View>

        {/* PROFIT BREAKDOWN — keep together */}
        <View wrap={false}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionBar} />
            <Text style={styles.sectionTitle}>PROFIT CALCULATION</Text>
          </View>
          <View style={styles.breakdown}>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Total rent expected</Text>
              <Text style={styles.breakdownValue}>{qar(summary.totalRent)}</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Total collected</Text>
              <Text style={[styles.breakdownValue, { color: palette.green }]}>
                {qar(summary.totalCollected)}
              </Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Outstanding (unpaid)</Text>
              <Text
                style={[
                  styles.breakdownValue,
                  { color: summary.totalDue > 0 ? palette.amber : palette.subtle },
                ]}
              >
                {qar(summary.totalDue)}
              </Text>
            </View>
            <View style={[styles.breakdownRow, styles.breakdownLast]}>
              <Text style={styles.breakdownLabel}>Less: total expenses</Text>
              <Text style={[styles.breakdownValue, { color: palette.red }]}>
                −{qar(summary.totalExpenses)}
              </Text>
            </View>
            <View style={styles.breakdownTotal}>
              <Text style={[styles.breakdownLabel, { color: palette.ink, fontFamily: "Helvetica-Bold" }]}>
                {isProfit ? "NET PROFIT" : "NET LOSS"}
              </Text>
              <Text
                style={[
                  styles.breakdownValue,
                  { fontSize: 12, color: isProfit ? palette.green : palette.red },
                ]}
              >
                {qar(summary.netProfit)}
              </Text>
            </View>
          </View>
        </View>

        {/* SHAREHOLDER DISTRIBUTION — keep together */}
        {summary.shareholderSplits.length > 0 && (
          <View wrap={false}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionBar} />
              <Text style={styles.sectionTitle}>SHAREHOLDER DISTRIBUTION</Text>
              <Text style={styles.sectionCount}>
                {summary.shareholderSplits.length} shareholder
                {summary.shareholderSplits.length === 1 ? "" : "s"}
              </Text>
            </View>
            <View style={styles.table}>
              <View style={styles.tableHeader}>
                <Text style={[styles.tableHeaderCell, { flex: 3 }]}>SHAREHOLDER</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1, textAlign: "center" }]}>SHARE</Text>
                <Text style={[styles.tableHeaderCell, { flex: 1.4, textAlign: "right" }]}>AMOUNT</Text>
              </View>
              {summary.shareholderSplits.map((s, i) => (
                <View
                  key={s.id}
                  style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
                >
                  <Text style={[{ flex: 3, fontSize: 9 }, styles.bold]}>{s.name}</Text>
                  <Text
                    style={{
                      flex: 1,
                      fontSize: 9,
                      textAlign: "center",
                      color: palette.muted,
                    }}
                  >
                    {s.percentage}%
                  </Text>
                  <Text
                    style={[
                      styles.cellRight,
                      styles.bold,
                      {
                        flex: 1.4,
                        color: s.amount >= 0 ? palette.green : palette.red,
                      },
                    ]}
                  >
                    {qar(s.amount)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        <Footer companyName={settings.companyName} />
      </Page>
    </Document>
  );
}
