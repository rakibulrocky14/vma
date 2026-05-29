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
  emerald: "#047857",
  emeraldBg: "#D1FAE5",
  emeraldBorder: "#6EE7B7",
  amber: "#B45309",
  amberBg: "#FFFBEB",
  amberBorder: "#FDE68A",
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
  reportSub: {
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

  /* ── SOURCE INFO STRIP ── */
  sourceStrip: {
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
  sourceName: { fontSize: 12, fontFamily: "Helvetica-Bold", color: P.ink },
  sourceContact: { fontSize: 7.5, color: P.muted, marginTop: 2 },

  /* ── SUMMARY HERO ── */
  hero: {
    backgroundColor: "#0A2647",
    borderRadius: 4,
    paddingVertical: 12,
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
    fontSize: 20,
    fontFamily: "Helvetica-Bold",
    color: P.white,
    letterSpacing: -0.3,
  },
  heroSub: { fontSize: 7, color: "#93C5FD", marginTop: 3 },

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

  /* ── PROPERTY CARD ── */
  propertyCard: {
    borderWidth: 1,
    borderColor: P.border,
    borderStyle: "solid",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  propertyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: P.bgSoft,
    borderBottomWidth: 1,
    borderBottomColor: P.border,
    borderBottomStyle: "solid",
  },
  propertyName: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: P.ink,
  },
  propertyShareBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  /* ── DISTRIBUTION TABLE (inside card) ── */
  distRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: P.hairline,
    borderBottomStyle: "solid",
  },
  distRowLast: { borderBottomWidth: 0 },

  /* ── SUMMARY TABLE ── */
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

function pct(n: number) {
  return `${Number(n).toFixed(2)}%`;
}

function qar(n: number) {
  return `QAR ${n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

interface ShareRow {
  id: string;
  shareholderName: string;
  sharePercent: number;
  effectivePercent: number;
  amount: number;
}

interface EntryRow {
  id: string;
  propertyName: string;
  mySharePercent: number;
  shares: ShareRow[];
  totalDistributed: number;
  netMyPercent: number;
  profit: number;
  myCut: number;
  distributedAmount: number;
  myNetAmount: number;
}

export interface IncomeSourceReportData {
  source: { id: string; name: string; phone: string | null; notes: string | null };
  year?: number;
  month?: number;
  entries: EntryRow[];
  settings: { companyName: string; logoUrl: string | null; address: string | null };
}

function PageHeader({ data }: { data: IncomeSourceReportData }) {
  const { settings, source } = data;
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
          <Text style={S.reportType}>INCOME SOURCE REPORT</Text>
          <Text style={S.reportTitle}>{source.name}</Text>
          {data.year !== undefined && data.month !== undefined ? (
            <Text style={S.reportSub}>{MONTHS[data.month - 1]} {data.year}</Text>
          ) : source.phone ? (
            <Text style={S.reportSub}>{source.phone}</Text>
          ) : null}
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

export function IncomeSourcePDF({ data }: { data: IncomeSourceReportData }) {
  const { source, entries, settings } = data;
  const initial = source.name.trim().charAt(0).toUpperCase() || "I";
  const totalProperties = entries.length;
  const monthLabel = data.year !== undefined && data.month !== undefined
    ? `${MONTHS[data.month - 1]} ${data.year}`
    : "";
  const totalProfit = entries.reduce((sum, e) => sum + e.profit, 0);
  const totalMyCut = entries.reduce((sum, e) => sum + e.myCut, 0);
  const totalDistributedAmount = entries.reduce((sum, e) => sum + e.distributedAmount, 0);
  const totalMyNetAmount = entries.reduce((sum, e) => sum + e.myNetAmount, 0);

  return (
    <Document title={`Income Source — ${source.name}`} author={settings.companyName}>
      <Page size="A4" style={S.page}>
        <PageHeader data={data} />

        <View style={S.content}>
          {/* Source info strip */}
          <View style={S.sourceStrip} wrap={false}>
            <View style={S.avatar}>
              <Text style={S.avatarText}>{initial}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={S.sourceName}>{source.name}</Text>
              <Text style={S.sourceContact}>
                {[source.phone ? `Phone: ${source.phone}` : null].filter(Boolean).join("  ·  ") || "No contact on file"}
              </Text>
              {source.notes && (
                <Text style={{ fontSize: 7, color: P.muted, marginTop: 3 }}>{source.notes}</Text>
              )}
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={{ fontSize: 6, fontFamily: "Helvetica-Bold", color: P.muted, letterSpacing: 1.5 }}>
                PROPERTIES
              </Text>
              <Text style={{ fontSize: 18, fontFamily: "Helvetica-Bold", color: P.ink, marginTop: 2 }}>
                {totalProperties}
              </Text>
            </View>
          </View>

          {/* Hero — my net earnings this month */}
          <View style={S.hero} wrap={false}>
            <View>
              <Text style={S.heroLabel}>MY NET EARNINGS{monthLabel ? ` — ${monthLabel.toUpperCase()}` : ""}</Text>
              <Text style={S.heroValue}>{qar(totalMyNetAmount)}</Text>
              <Text style={S.heroSub}>
                After distributions, across {totalProperties} {totalProperties === 1 ? "property" : "properties"}
              </Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <View style={{ marginBottom: 4 }}>
                <Text style={{ fontSize: 6, fontFamily: "Helvetica-Bold", color: "#93C5FD", letterSpacing: 1.5 }}>
                  TOTAL PROFIT
                </Text>
                <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: "#FFFFFF", textAlign: "right" }}>
                  {qar(totalProfit)}
                </Text>
              </View>
              <View>
                <Text style={{ fontSize: 6, fontFamily: "Helvetica-Bold", color: "#93C5FD", letterSpacing: 1.5 }}>
                  GIVEN AWAY
                </Text>
                <Text style={{ fontSize: 10, fontFamily: "Helvetica-Bold", color: "#FCD34D", textAlign: "right" }}>
                  {qar(totalDistributedAmount)}
                </Text>
              </View>
            </View>
          </View>

          {/* Properties + profit table */}
          <View style={S.sectionHead}>
            <View style={S.sectionBar} />
            <Text style={S.sectionTitle}>PROPERTIES &amp; PROFITS{monthLabel ? ` — ${monthLabel.toUpperCase()}` : ""}</Text>
            <Text style={S.sectionCount}>{totalProperties} {totalProperties === 1 ? "property" : "properties"}</Text>
          </View>

          {entries.length === 0 ? (
            <View style={[S.table]}>
              <View style={S.tRow}>
                <Text style={[{ flex: 1, fontSize: 8 }, S.italic, { color: P.subtle }]}>
                  No properties tracked for this source
                </Text>
              </View>
            </View>
          ) : (
            <View style={S.table}>
              <View style={S.tHead} fixed>
                <Text style={[S.tHeadCell, { flex: 2 }]}>PROPERTY</Text>
                <Text style={[S.tHeadCell, { flex: 0.7, textAlign: "center" }]}>MY %</Text>
                <Text style={[S.tHeadCell, { flex: 1.3, textAlign: "right" }]}>PROFIT</Text>
                <Text style={[S.tHeadCell, { flex: 1.3, textAlign: "right" }]}>MY CUT</Text>
                <Text style={[S.tHeadCell, { flex: 1.3, textAlign: "right" }]}>GIVEN AWAY</Text>
                <Text style={[S.tHeadCell, { flex: 1.4, textAlign: "right" }]}>I KEEP</Text>
              </View>
              {entries.map((entry, i) => (
                <View key={entry.id} style={[S.tRow, i % 2 === 1 ? S.tRowAlt : {}]} wrap={false}>
                  <Text style={[{ flex: 2, fontSize: 8.5 }, S.bold]}>{entry.propertyName}</Text>
                  <Text style={{ flex: 0.7, fontSize: 8, textAlign: "center", color: P.muted }}>
                    {pct(entry.mySharePercent)}
                  </Text>
                  <Text style={{ flex: 1.3, fontSize: 8.5, textAlign: "right", color: entry.profit > 0 ? P.ink : P.subtle }}>
                    {entry.profit > 0 ? qar(entry.profit) : "—"}
                  </Text>
                  <Text style={{ flex: 1.3, fontSize: 8.5, textAlign: "right", color: P.emerald }}>
                    {qar(entry.myCut)}
                  </Text>
                  <Text style={{ flex: 1.3, fontSize: 8.5, textAlign: "right", color: entry.distributedAmount > 0 ? P.amber : P.subtle }}>
                    {entry.distributedAmount > 0 ? qar(entry.distributedAmount) : "—"}
                  </Text>
                  <Text style={[{ flex: 1.4, fontSize: 8.5, textAlign: "right", color: P.emerald }, S.bold]}>
                    {qar(entry.myNetAmount)}
                  </Text>
                </View>
              ))}
              <View style={S.tFoot} wrap={false}>
                <Text style={[{ flex: 2, fontSize: 8 }, S.bold]}>TOTAL</Text>
                <Text style={{ flex: 0.7 }} />
                <Text style={[{ flex: 1.3, fontSize: 8, textAlign: "right", color: P.ink }, S.bold]}>{qar(totalProfit)}</Text>
                <Text style={[{ flex: 1.3, fontSize: 8, textAlign: "right", color: P.emerald }, S.bold]}>{qar(totalMyCut)}</Text>
                <Text style={[{ flex: 1.3, fontSize: 8, textAlign: "right", color: P.amber }, S.bold]}>{qar(totalDistributedAmount)}</Text>
                <Text style={[{ flex: 1.4, fontSize: 8, textAlign: "right", color: P.emerald }, S.bold]}>{qar(totalMyNetAmount)}</Text>
              </View>
            </View>
          )}

          {/* Detailed property cards with distributions */}
          {entries.some((e) => e.shares.length > 0) && (
            <>
              <View style={S.sectionHead}>
                <View style={S.sectionBar} />
                <Text style={S.sectionTitle}>DISTRIBUTION DETAILS</Text>
              </View>

              {entries.filter((e) => e.shares.length > 0).map((entry) => (
                <View key={entry.id} style={S.propertyCard} wrap={false}>
                  <View style={S.propertyHeader}>
                    <Text style={S.propertyName}>{entry.propertyName}</Text>
                    <View style={S.propertyShareBadge}>
                      <Text style={{ fontSize: 7, color: P.muted }}>
                        My share: <Text style={{ color: P.emerald, fontFamily: "Helvetica-Bold" }}>{pct(entry.mySharePercent)}</Text>
                      </Text>
                      <Text style={{ fontSize: 7, color: P.muted }}>
                        I keep: <Text style={{ color: P.ink, fontFamily: "Helvetica-Bold" }}>{pct(entry.netMyPercent)}</Text>
                      </Text>
                    </View>
                  </View>

                  {entry.shares.map((sh, idx) => (
                    <View
                      key={sh.id}
                      style={[S.distRow, idx === entry.shares.length - 1 ? S.distRowLast : {}]}
                    >
                      <View style={{ flex: 1, flexDirection: "row", alignItems: "center", gap: 7 }}>
                        <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: "#1E3A5F", alignItems: "center", justifyContent: "center" }}>
                          <Text style={{ fontSize: 8, color: P.gold, fontFamily: "Helvetica-Bold" }}>
                            {sh.shareholderName.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                        <Text style={{ fontSize: 8.5, fontFamily: "Helvetica-Bold", color: P.body }}>{sh.shareholderName}</Text>
                      </View>
                      <Text style={{ fontSize: 7.5, color: P.muted, marginRight: 10 }}>
                        {pct(sh.sharePercent)} of my cut
                      </Text>
                      <Text style={{ fontSize: 9, color: P.amber, fontFamily: "Helvetica-Bold" }}>
                        {sh.amount > 0 ? qar(sh.amount) : "—"}
                      </Text>
                    </View>
                  ))}
                </View>
              ))}
            </>
          )}
        </View>

        <PageFooter companyName={settings.companyName} />
      </Page>
    </Document>
  );
}
