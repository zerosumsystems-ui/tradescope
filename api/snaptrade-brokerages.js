import { Snaptrade } from 'snaptrade-typescript-sdk';

const snaptrade = new Snaptrade({
  consumerKey: process.env.SNAPTRADE_CONSUMER_KEY,
  clientId: process.env.SNAPTRADE_CLIENT_ID,
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get partner info to see which brokerages are enabled for this API key
    const { data: partnerInfo } = await snaptrade.referenceData.getPartnerInfo();

    // Get full list of all brokerages for reference
    const { data: allBrokerages } = await snaptrade.referenceData.listAllBrokerages();

    // Find enabled brokerage slugs from partner info
    const enabledSlugs = new Set(
      (partnerInfo?.allowedBrokerages || partnerInfo?.enabled_brokerages || [])
        .map(b => typeof b === 'string' ? b : b?.slug)
        .filter(Boolean)
    );

    // Match enabled slugs to full brokerage details
    const enabledBrokerages = enabledSlugs.size > 0
      ? (allBrokerages || []).filter(b => enabledSlugs.has(b.slug))
      : [];

    const brokerageNames = enabledBrokerages.map(b => b.name || b.slug);
    const hasFidelity = (allBrokerages || []).some(b =>
      (b.name || '').toLowerCase().includes('fidelity') ||
      (b.slug || '').toLowerCase().includes('fidelity')
    );

    return res.status(200).json({
      clientId: partnerInfo?.slug || partnerInfo?.name || process.env.SNAPTRADE_CLIENT_ID,
      enabledCount: enabledSlugs.size,
      enabledBrokerages: brokerageNames,
      enabledSlugs: [...enabledSlugs],
      fidelityInGlobalList: hasFidelity,
      fidelityEnabled: brokerageNames.some(n => n.toLowerCase().includes('fidelity')),
      rawPartnerInfo: partnerInfo,
    });
  } catch (err) {
    console.error('SnapTrade brokerages error:', err);
    const detail = err.response?.data || err.responseBody || err.body;
    const msg = typeof detail === 'object' ? JSON.stringify(detail) : (detail || err.message);
    return res.status(err.response?.status || err.status || 500).json({ error: msg });
  }
}
