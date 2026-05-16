import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

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
  blue: "#1d4ed8",
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

  /* PERSON STRIP */
  personStrip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: palette.bgSoft,
    borderRadius: 3,
    marginBottom: 10,
    gap: 12,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: palette.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#ffffff",
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
  },
  personName: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: palette.ink,
  },
  personContact: { fontSize: 7, color: palette.muted, marginTop: 1 },

  /* HERO */
  hero: {
    backgroundColor: palette.navy,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderRadius: 3,
  },
  heroLabel: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#cbd5e1",
    letterSpacing: 1.4,
  },
  heroValue: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#ffffff",
    marginTop: 3,
  },
  heroSub: { fontSize: 7, color: "#94a3b8", marginTop: 2 },

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
    paddingVertical: 3,
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
  bold: { fontFamily: "Helvetica-Bold" },

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

interface ShareholderReportData {
  shareholder: { id: string; name: string; phone: string | null; email: string | null };
  year: number;
  month: number;
  villaEntries: VillaEntry[];
  settings: { companyName: string; logoUrl: string | null; address: string | null };
}

function Header({ data }: { data: ShareholderReportData }) {
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
        <Text style={styles.reportKicker}>SHAREHOLDER STATEMENT</Text>
        <Text style={styles.reportTitle}>{data.shareholder.name}</Text>
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

export function ShareholderReportPDF({ data }: { data: ShareholderReportData }) {
  const { shareholder, villaEntries, settings } = data;
  const totalEarnings = villaEntries.reduce((sum, v) => sum + v.shareholderAmount, 0);
  const totalCollected = villaEntries.reduce((sum, v) => sum + v.totalCollected, 0);
  const totalExpenses = villaEntries.reduce((sum, v) => sum + v.totalExpenses, 0);
  const totalNet = villaEntries.reduce((sum, v) => sum + v.netProfit, 0);
  const monthLabel = `${MONTHS[data.month - 1]} ${data.year}`;
  const initial = shareholder.name.trim().charAt(0).toUpperCase() || "S";

  return (
    <Document
      title={`${shareholder.name} — ${monthLabel}`}
      author={settings.companyName}
    >
      <Page size="A4" style={styles.page}>
        <Header data={data} />
        <View style={styles.divider} />
        <View style={styles.dividerAccent} />

        {/* PERSON STRIP */}
        <View style={styles.personStrip} wrap={false}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.personName}>{shareholder.name}</Text>
            <Text style={styles.personContact}>
              {[shareholder.phone, shareholder.email].filter(Boolean).join("  •  ") ||
                "No contact information on file"}
            </Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.personContact}>STATEMENT PERIOD</Text>
            <Text style={{ fontSize: 11, fontFamily: "Helvetica-Bold", color: palette.ink }}>
              {monthLabel}
            </Text>
          </View>
        </View>

        {/* HERO TOTAL */}
        <View style={styles.hero} wrap={false}>
          <Text style={styles.heroLabel}>TOTAL EARNINGS — {monthLabel.toUpperCase()}</Text>
          <Text style={styles.heroValue}>{qar(totalEarnings)}</Text>
          <Text style={styles.heroSub}>
            Across {villaEntries.length} {villaEntries.length === 1 ? "property" : "properties"}
          </Text>
        </View>

        {/* VILLAS TABLE — rows wrap individually to next page */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionBar} />
          <Text style={styles.sectionTitle}>EARNINGS BY PROPERTY</Text>
          <Text style={styles.sectionCount}>
            {villaEntries.length} {villaEntries.length === 1 ? "property" : "properties"}
          </Text>
        </View>
        <View style={styles.table}>
          <View style={styles.tableHeader} fixed>
            <Text style={[styles.tableHeaderCell, { flex: 1.8 }]}>VILLA</Text>
            <Text style={[styles.tableHeaderCell, { flex: 0.8, textAlign: "center" }]}>SHARE</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1.4, textAlign: "right" }]}>COLLECTED</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1.3, textAlign: "right" }]}>EXPENSES</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1.3, textAlign: "right" }]}>NET</Text>
            <Text style={[styles.tableHeaderCell, { flex: 1.5, textAlign: "right" }]}>YOUR SHARE</Text>
          </View>
          {villaEntries.length === 0 ? (
            <View style={styles.tableRow}>
              <Text style={{ flex: 1, fontSize: 9, color: palette.subtle, fontStyle: "italic" }}>
                Not assigned to any villas
              </Text>
            </View>
          ) : (
            villaEntries.map((v, i) => (
              <View
                key={v.villaId}
                style={[styles.tableRow, i % 2 === 1 ? styles.tableRowAlt : {}]}
                wrap={false}
              >
                <View style={{ flex: 1.8 }}>
                  <Text style={[{ fontSize: 9 }, styles.bold]}>{v.villaNumber}</Text>
                  <Text style={{ fontSize: 7.5, color: palette.muted, marginTop: 1 }}>
                    {v.address}
                  </Text>
                </View>
                <Text
                  style={{
                    flex: 0.8,
                    fontSize: 9,
                    textAlign: "center",
                    color: palette.muted,
                  }}
                >
                  {v.percentage}%
                </Text>
                <Text
                  style={{
                    flex: 1.4,
                    fontSize: 9,
                    textAlign: "right",
                    color: palette.green,
                  }}
                >
                  {qar(v.totalCollected)}
                </Text>
                <Text
                  style={{
                    flex: 1.3,
                    fontSize: 9,
                    textAlign: "right",
                    color: palette.red,
                  }}
                >
                  {qar(v.totalExpenses)}
                </Text>
                <Text
                  style={{
                    flex: 1.3,
                    fontSize: 9,
                    textAlign: "right",
                    color: v.netProfit >= 0 ? palette.green : palette.red,
                  }}
                >
                  {qar(v.netProfit)}
                </Text>
                <Text
                  style={[
                    {
                      flex: 1.5,
                      fontSize: 9,
                      textAlign: "right",
                      color: v.shareholderAmount >= 0 ? palette.blue : palette.red,
                    },
                    styles.bold,
                  ]}
                >
                  {qar(v.shareholderAmount)}
                </Text>
              </View>
            ))
          )}
          <View style={styles.tableFooter} wrap={false}>
            <Text style={[{ flex: 1.8, fontSize: 9 }, styles.bold]}>TOTAL</Text>
            <Text style={{ flex: 0.8 }} />
            <Text
              style={[
                { flex: 1.4, fontSize: 9, textAlign: "right", color: palette.green },
                styles.bold,
              ]}
            >
              {qar(totalCollected)}
            </Text>
            <Text
              style={[
                { flex: 1.3, fontSize: 9, textAlign: "right", color: palette.red },
                styles.bold,
              ]}
            >
              {qar(totalExpenses)}
            </Text>
            <Text
              style={[
                {
                  flex: 1.3,
                  fontSize: 9,
                  textAlign: "right",
                  color: totalNet >= 0 ? palette.green : palette.red,
                },
                styles.bold,
              ]}
            >
              {qar(totalNet)}
            </Text>
            <Text
              style={[
                { flex: 1.5, fontSize: 9, textAlign: "right", color: palette.blue },
                styles.bold,
              ]}
            >
              {qar(totalEarnings)}
            </Text>
          </View>
        </View>

        <Footer companyName={settings.companyName} />
      </Page>
    </Document>
  );
}
