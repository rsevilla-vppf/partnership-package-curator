"use client";

import { useState, useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

const rolesData = [
    {
        id: 'resource', name: 'Resource Sponsor', category: 'Core Operations',
        description: 'Primary operational funding for the event.',
        tiers: {
            1: ['Primary operational funding: ₱10,000 – ₱20,000'],
            2: ['Primary operational funding: ₱20,001 – ₱50,000'],
            3: ['Primary operational funding: ₱50,001 – ₱200,000']
        }
    },
    {
        id: 'grant', name: 'Grant Sponsor', category: 'Core Operations',
        description: 'Direct financial grants, scholarships, or cash prize pools for winners.',
        tiers: {
            1: ['₱5,000 Micro-grants for student projects'],
            2: ['₱10,000 Micro-grants', '₱10,000 Secondary cash prize pool'],
            3: ['₱10,000 Micro-grants', '₱20,000 Secondary cash prize pool', '₱30,000+ Grand Champion funding', '2 Paid internships for winners']
        }
    },
    {
        id: 'tech', name: 'Technology Sponsor', category: 'Core Operations',
        description: 'Provide software licenses, API credits, or cloud platforms for participants.',
        tiers: {
            1: ['15 Users (Temporary licenses / API access)'],
            2: ['50 Users (Temporary licenses)', '5 Tech certification exam vouchers'],
            3: ['100+ Users (Temporary licenses)', '$2,000+ Cloud hosting credits', '20 Tech certification vouchers', '15 Permanent software licenses']
        }
    },
    {
        id: 'venue', name: 'Venue Sponsor', category: 'Core Operations',
        description: 'Host our events by providing main stages, meeting rooms, and physical spaces.',
        tiers: {
            1: ['1 Meeting room for committee (20 Pax)'],
            2: ['2 Meeting rooms for committee', '1 Mid-sized hall (100 Pax)', '15 Table/chair sets'],
            3: ['All available meeting rooms (unrestricted access)', '2 Mid-sized halls (100 Pax each)', '30+ Table/chair sets with layout support', '1 Premium auditorium (200+ Pax) with stage']
        }
    },
    {
        id: 'logistics', name: 'Logistics Sponsor', category: 'Core Operations',
        description: 'Empower our operations with networking, transport, or essential hardware.',
        tiers: {
            1: ['2 Sets AV Equipment', '5 Heavy-duty extension cords'],
            2: ['4 Sets AV Equipment', '15 Heavy-duty extension cords', '1 High-speed internet router', '1 Transport van (15 Pax)'],
            3: ['Full main stage AV setup', 'Full venue network connectivity', '30+ Heavy-duty extension cords & power distribution', '2 Transport buses (100 Pax)']
        }
    },
    {
        id: 'knowledge', name: 'Knowledge Sponsor', category: 'Program & Experience',
        description: 'Share expertise via workshops, panels, and curriculum design.',
        tiers: {
            1: ['1 Speaker for short Q&A/Panel (20 mins)', '1 Standardized learning module'],
            2: ['2 Speakers & 3 Learning modules', 'Facilitate 1 tech workshop (90 mins)'],
            3: ['3+ Speakers & Full Curriculum', 'Facilitate 2 tech workshops', '1 C-Level Program Keynote (contributed educational session)']
        }
    },
    {
        id: 'mentorship', name: 'Mentorship Sponsor', category: 'Program & Experience',
        description: 'Guide participants directly during their project builds and hackathons.',
        tiers: {
            1: ['1 Hour online AMA / Structured written evaluation', '1 Live technical mentor (4-hr shift)'],
            2: ['2 Hours asynchronous feedback', '3 Live technical mentors', '2 Judges for Pitch Competition'],
            3: ['5 Hours asynchronous feedback', '5+ Live technical mentors', '3 Judges for Pitch Competition', '1 Embedded Scrum Master per team']
        }
    },
    {
        id: 'fnb', name: 'Food & Beverage Sponsor', category: 'Program & Experience',
        description: 'Fuel the community by sponsoring meals for attendees and volunteers.',
        tiers: {
            1: ['Coffee/Pastries for committee (20 Pax)', '20 Bottled waters for VIPs'],
            2: ['Coffee/Pastries (50 Pax)', '50 Bottled waters', 'Full meal catering for volunteers'],
            3: ['Coffee/Pastries (100 Pax)', '100+ Bottled water', 'Full meal package for attendees', 'Exclusive VIP networking dinner']
        }
    },
    {
        id: 'swag', name: 'Swag Sponsor', category: 'Program & Experience',
        description: 'Delight attendees with premium customized merchandise and gear.',
        tiers: {
            1: ['50 Pcs basic merch (Stickers, Pens, etc.)'],
            2: ['100 Pcs basic merch', '50 Event shirts for staff', '50 Branded attendee fashion merch'],
            3: ['200+ Pcs basic merch', '150+ Branded attendee fashion merch', '5+ Premium tech giveaways (min. ₱1,500 value each)']
        }
    },
    {
        id: 'media', name: 'Media Sponsor', category: 'Reach & Audience',
        description: 'Boost event awareness through cross-posting, articles, and coverage.',
        tiers: {
            1: ['2 Social media cross-posts/blasts', '1 Dedicated event photographer'],
            2: ['4 Social media cross-posts', '1 Pre-event feature article', '3 Dedicated event photographers'],
            3: ['10+ Social media cross-posts', '3 Pre-event feature articles', 'Full Media Team', 'Pro live-stream & Aftermovie']
        }
    },
    {
        id: 'community', name: 'Community Sponsor', category: 'Reach & Audience',
        description: 'Mobilize tech groups, invite your members, and guarantee attendance.',
        tiers: {
            1: ['2 Social media cross-posts/blasts', 'Up to 15 mobilized attendees from your community'],
            2: ['4 Social media cross-posts', 'Up to 30 mobilized attendees from your community', '1 Formed project team to compete'],
            3: ['10+ Social media cross-posts', 'Up to 50 mobilized attendees from your community', '3 Formed project teams to compete']
        }
    },
    {
        id: 'ecosystem', name: 'Ecosystem Sponsor', category: 'Reach & Audience',
        description: 'Connect DEVCON with high-level industry stakeholders and tech councils.',
        tiers: {
            1: ['2 Direct email intros to industry contacts'],
            2: ['5 Direct email intros', '1 Pitch meeting with local incubators'],
            3: ['10+ Direct email intros', '3 Pitch meetings secured with local incubators/investors', 'Co-host a DEVCON side event or networking mixer']
        }
    }
];

const tiers: Record<number, string> = {
    0: 'None',
    1: 'Standard',
    2: 'Major',
    3: 'Lead'
};

const autoBenefits: Record<number, string[]> = {
    0: [],
    1: [
        "Small logo on website & tarp",
        '"Supported by [Sponsor]" Co-Branding',
        "1 VIP pass",
        "Standard digital & physical certificate",
        "Standard gift box with DEVCON branded items"
    ],
    2: [
        "Medium logo on website, tarp & slides",
        '"Powered by [Sponsor]" Co-Branding',
        "3 VIP passes",
        "Premium framed certificate",
        "Pre-assigned booth space on the event floor",
        "10-minute open floor slot",
        "Deluxe gift box with premium DEVCON merchandise and partner inclusions"
    ],
    3: [
        "Premium large logo on all collaterals & livestream",
        '"Presented by [Sponsor]" Co-Branding',
        "5 VIP passes",
        "Premium trophy awarded on stage",
        "Partner-selected booth space (prime location) on the event floor",
        "20-minute open floor slot",
        "Executive gift box with exclusive DEVCON collectibles and curated partner items"
    ]
};

const baseAllowances: Record<number, string> = {
    0: '',
    1: '1 Benefit Category with 2 Standard Perk Picks',
    2: 'Up to 2 Benefit Categories (4 Flexible Standard Picks total)<br/>+ 1 Premium (★) Pick from your selected categories',
    3: 'Up to 3 Benefit Categories (6 Flexible Standard Picks total)<br/>+ 2 Premium (★) Picks from any selected categories'
};

const perkCategories = [
    {
        name: 'Talent & Recruitment',
        standard: [
            { name: 'Talent Pipeline Access', desc: "Full access to opt-in resume database, demographic reports, and up to 3 job postings on DEVCON's channels." },
            { name: 'Recruitment Mailing', desc: 'Feature career opportunities in 1 dedicated pre-event email blast to all registered attendees.' },
            { name: 'Custom Pre-Screening Question', desc: 'Add one custom technical or culture-fit question to the event registration form.' }
        ],
        premium: [
            { name: 'Fast-Track Interview Sessions', desc: 'Reserved time slots and dedicated spaces to conduct structured on-the-spot initial interviews with attendees during the event.' },
            { name: 'Right of First Refusal', desc: '30-day exclusive window to negotiate hiring or incubating the Grand Champion team before they engage with any other sponsor or recruiter.' }
        ]
    },
    {
        name: 'Strategic Connections & B2B Ecosystem',
        standard: [
            { name: 'Early Innovation Pipeline', desc: 'Receive exclusive early access to the pitch materials and contact details of hackathon teams.' },
            { name: 'Official LinkedIn Ecosystem Endorsement', desc: 'An official LinkedIn post publicly endorsing your contribution to the Philippine tech ecosystem.' },
            { name: 'Partner Handover Brief Inclusion', desc: "Include a one-page B2B brochure, executive summary, or exclusive partner offer directly inside DEVCON's official Pre-Event Handover Brief." }
        ],
        premium: [
            { name: 'Partner Ecosystem Directory', desc: 'Receive a private, consolidated contact directory containing opt-in business contacts for all participating sponsors and VIPs.' },
            { name: 'Dedicated Community Channel', desc: 'Receive a permanent, dedicated channel in the official DEVCON Laguna Discord/community platform.' }
        ]
    },
    {
        name: 'Brand & Visibility',
        standard: [
            { name: 'Sponsored Content Series', desc: 'DEVCON-produced multi-post branded content campaign (reels, etc.) published across our channels leading up to and during the event.' },
            { name: 'Sponsor Post Amplification', desc: 'Submit your own content asset and DEVCON shares it directly on our official channels — you control the message.' },
            { name: 'Attendee Challenge', desc: 'DEVCON hosts a live technical challenge during the event on behalf of the sponsor — sponsor defines the problem and prizes.' }
        ],
        premium: [
            { name: 'Podcast Feature', desc: 'Your representative joins a DEVCON podcast episode as a guest expert for an in-depth interview.' },
            { name: 'Sponsor Film Challenge', desc: 'DEVCON organizes a video competition on behalf of the sponsor.' }
        ]
    },
    {
        name: 'Partner Intelligence & Insights',
        standard: [
            { name: 'Attendee Demographic Report', desc: 'A post-event breakdown of attendee profiles compiled by DEVCON.' },
            { name: 'Brand Perception Survey', desc: 'A structured post-event survey sent to all registered attendees measuring brand awareness, sentiment, etc.' },
            { name: 'Custom Live-Event Poll', desc: 'DEVCON integrates up to 2 targeted polling questions into our interactive main-stage segments or official event app.' }
        ],
        premium: [
            { name: 'CSR & ROI Impact Report', desc: 'A professionally produced post-event report documenting contribution, community reach, and measurable social return.' },
            { name: 'Returning Partner Recognition', desc: 'A dedicated feature recognizing your sustained commitment across multiple DEVCON events.' }
        ]
    }
];

export default function Home() {
    const [selectedRoles, setSelectedRoles] = useState<Record<string, boolean>>({});
    const [selections, setSelections] = useState<Record<string, number>>({});
    const [selectedPerks, setSelectedPerks] = useState<Record<string, boolean>>({});
    const [showSummary, setShowSummary] = useState(false);
    const [partnerName, setPartnerName] = useState('');

    const toggleRole = (roleId: string) => {
        setSelectedRoles(prev => {
            const newState = { ...prev, [roleId]: !prev[roleId] };
            // If turning off a role, remove its tier selection so it doesn't count towards bonus/overall
            if (!newState[roleId]) {
                setSelections(s => ({ ...s, [roleId]: 0 }));
            }
            return newState;
        });
    };

    const handleSelectionChange = (roleId: string, value: number) => {
        setSelections(prev => ({ ...prev, [roleId]: value }));
    };

    const togglePerk = (perkName: string) => {
        setSelectedPerks(prev => ({ ...prev, [perkName]: !prev[perkName] }));
    };

    const summaryRef = useRef<HTMLDivElement>(null);
    const pdfTemplateRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    const exportPDF = async () => {
        console.log("exportPDF called, ref.current:", pdfTemplateRef.current);
        if (!pdfTemplateRef.current) {
            alert("Error: The PDF template is not mounted. Cannot export.");
            return;
        }
        setIsExporting(true);
        
        // Use setTimeout to ensure React re-renders the DOM with formatting properly before capturing
        setTimeout(async () => {
            try {
                const dataUrl = await toPng(pdfTemplateRef.current!, {
                    quality: 1,
                    backgroundColor: '#ffffff',
                    pixelRatio: 2 // High res
                });
                
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'pt',
                    format: 'a4'
                });

                const imgProps = pdf.getImageProperties(dataUrl);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                const pageHeight = pdf.internal.pageSize.getHeight();

                let position = 0;
                let heightLeft = pdfHeight;

                // First Page
                pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
                heightLeft -= pageHeight;

                // Subsequent Pages
                while (heightLeft > 0) {
                    position = heightLeft - pdfHeight;
                    pdf.addPage();
                    // Move the image UP by 'position' to show the next slice
                    pdf.addImage(dataUrl, 'PNG', 0, position, pdfWidth, pdfHeight);
                    heightLeft -= pageHeight;
                }

                const safeName = partnerName ? partnerName.replace(/[^a-z0-9]/gi, '_') : 'Sponsor';
                pdf.save(`${safeName}_DEVCON_Partnership_Summary.pdf`);
            } catch (error) {
                console.error('Error generating PDF:', error);
                alert('Failed to generate PDF. Please try again.');
            } finally {
                setIsExporting(false);
            }
        }, 100); // 100ms let UI update first
    };

    let maxTier = 0;
    let activeCount = 0;

    for (const key in selections) {
        // Only count if it's an actively selected role
        if (selections[key] > 0 && selectedRoles[key]) {
            activeCount++;
            if (selections[key] > maxTier) {
                maxTier = selections[key];
            }
        }
    }

    const bonusCategories = Math.floor(activeCount / 3);

    useEffect(() => {
        if (maxTier <= 1) {
            setSelectedPerks(prev => {
                let hasChanges = false;
                const nextState = { ...prev };
                perkCategories.forEach(cat => {
                    cat.premium.forEach(p => {
                        if (nextState[p.name]) {
                            nextState[p.name] = false;
                            hasChanges = true;
                        }
                    });
                });
                return hasChanges ? nextState : prev;
            });
        }
    }, [maxTier]);

    // Calculate dynamic allowances safely
    let allowedCategoriesLimit = 0;
    let allowedStandard = 0;
    let allowedPremium = 0;

    if (maxTier === 1) { 
        allowedCategoriesLimit = 1; // 1 main category
        allowedStandard = 2; 
        allowedPremium = 0; 
    }
    else if (maxTier === 2) { 
        allowedCategoriesLimit = 2; // Exactly 2 categories
        allowedStandard = 4; 
        allowedPremium = 1; 
    }
    else if (maxTier === 3) { 
        allowedCategoriesLimit = 3; // Exactly 3 categories
        allowedStandard = 6; 
        allowedPremium = 2; // 2 premium picks from any chosen category
    }

    allowedCategoriesLimit += bonusCategories;
    allowedStandard += bonusCategories;

    // Group selections by category to enforce strict category boundaries
    const categoryStats = perkCategories.map(cat => {
        const stdCount = cat.standard.filter(p => selectedPerks[p.name]).length;
        const premCount = cat.premium.filter(p => selectedPerks[p.name]).length;
        return {
            name: cat.name,
            stdCount,
            premCount,
            total: stdCount + premCount
        };
    });

    const activeCategoryCount = categoryStats.filter(c => c.total > 0).length;
    const totalStandardSelected = categoryStats.reduce((sum, c) => sum + c.stdCount, 0);
    const totalPremiumSelected = categoryStats.reduce((sum, c) => sum + c.premCount, 0);

    const standardGlobalLimitReached = totalStandardSelected >= allowedStandard;
    const premiumGlobalLimitReached = totalPremiumSelected >= allowedPremium;
    const categoryLimitReached = activeCategoryCount >= allowedCategoriesLimit;
    const pdfExportTemplate = (
        <div style={{ position: 'absolute', top: -9999, left: -9999, zIndex: -10, pointerEvents: 'none' }}>
            <div 
                ref={pdfTemplateRef} 
                style={{ width: '794px', minHeight: '1123px', backgroundColor: '#ffffff', color: '#1a1a1a', padding: '60px', boxSizing: 'border-box', fontFamily: 'Arial, sans-serif' }}
            >
                {/* Official Document Header */}
                <div style={{ borderBottom: '3px solid #E31E7A', paddingBottom: '20px', marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                        <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 10px 0', color: '#2D1B4E' }}>PROPOSED PARTNERSHIP</h1>
                        <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>Generated on: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                    <img src="/logo.png" alt="DEVCON" style={{ height: '40px', objectFit: 'contain', filter: 'brightness(0) invert(0)' }} />
                </div>

                {/* Partnership Identity Block */}
                <div style={{ backgroundColor: '#f8f9fa', padding: '25px', borderRadius: '12px', marginBottom: '40px', borderLeft: '6px solid #E31E7A' }}>
                    <p style={{ margin: '0 0 5px 0', fontSize: '12px', textTransform: 'uppercase', fontWeight: 600, letterSpacing: '1px', color: '#E31E7A' }}>Proposed Sponsor</p>
                    <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 15px 0', color: '#2D1B4E' }}>{partnerName || 'Sponsor Name'}</h2>
                    
                    <div style={{ display: 'flex', gap: '40px' }}>
                        <div>
                            <p style={{ margin: '0 0 5px 0', fontSize: '11px', textTransform: 'uppercase', color: '#666' }}>Partnership Level</p>
                            <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: '#2D1B4E' }}>{tiers[maxTier]} Sponsor</p>
                        </div>
                        <div>
                            <p style={{ margin: '0 0 5px 0', fontSize: '11px', textTransform: 'uppercase', color: '#666' }}>Impact Roles</p>
                            <p style={{ margin: '0', fontSize: '18px', fontWeight: 'bold', color: '#2D1B4E' }}>{activeCount} Selected</p>
                        </div>
                        {bonusCategories > 0 && (
                            <div>
                                <p style={{ margin: '0 0 5px 0', fontSize: '11px', textTransform: 'uppercase', color: '#666' }}>Bonus Multiplier</p>
                                <p style={{ margin: '0', fontSize: '14px', fontWeight: 'bold', background: '#E31E7A', color: 'white', padding: '3px 10px', borderRadius: '20px', display: 'inline-block' }}>Eligible</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* SECTION 1: Contributions */}
                <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 20px 0', borderBottom: '1px solid #ddd', paddingBottom: '10px', color: '#2D1B4E' }}>
                        1. Sponsoring Roles (Your Give)
                    </h3>
                    {Object.entries(selections).filter(([_, level]) => level > 0 && selectedRoles[_]).map(([roleId, level]) => {
                        const role = rolesData.find(r => r.id === roleId)!;
                        return (
                            <div key={`pdf-role-${roleId}`} style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#fcfcfc', border: '1px solid #eaeaea', borderRadius: '8px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold', color: '#2D1B4E' }}>{role.name}</h4>
                                    <span style={{ fontSize: '11px', fontWeight: 'bold', backgroundColor: '#e2e8f0', color: '#4a5568', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                        {tiers[level]}
                                    </span>
                                </div>
                                <ul style={{ margin: 0, paddingLeft: '20px', color: '#4a5568', fontSize: '13px', lineHeight: '1.6' }}>
                                    {role.tiers[level as keyof typeof role.tiers].map((detail, idx) => (
                                        <li key={`pdf-detail-${idx}`} style={{ marginBottom: '4px' }}>
                                            <span dangerouslySetInnerHTML={{ __html: detail }}></span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>

                {/* SECTION 2: Benefits */}
                <div style={{ marginBottom: '40px' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0 0 20px 0', borderBottom: '1px solid #ddd', paddingBottom: '10px', color: '#2D1B4E' }}>
                        2. Included Value (Your Take)
                    </h3>

                    {/* Top Tier Package Box */}
                    <div style={{ marginBottom: '25px', border: '2px solid #E31E7A', borderRadius: '8px', overflow: 'hidden' }}>
                        <div style={{ backgroundColor: '#E31E7A', color: 'white', padding: '10px 15px', fontWeight: 'bold', fontSize: '14px' }}>
                            Core Baseline Package ({tiers[maxTier]})
                        </div>
                        <div style={{ padding: '15px', backgroundColor: '#fff0f6' }}>
                            <ul style={{ margin: 0, paddingLeft: '20px', color: '#2D1B4E', fontSize: '13px', lineHeight: '1.6', fontWeight: 500 }}>
                                {autoBenefits[maxTier].map((benefit, idx) => (
                                    <li key={`auto-${idx}`} style={{ marginBottom: '6px' }}>{benefit}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Selected Perks Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        {categoryStats.filter(c => c.total > 0).map(catStats => {
                            const category = perkCategories.find(c => c.name === catStats.name)!;
                            // Get selected perks in this category
                            const selectedInCat = category.standard.filter(p => selectedPerks[p.name]).map(p => ({ ...p, type: 'Standard' }))
                                .concat(category.premium.filter(p => selectedPerks[p.name]).map(p => ({ ...p, type: 'Premium' })));

                            if (selectedInCat.length === 0) return null;

                            return (
                                <div key={`pdf-cat-${catStats.name}`} style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '15px' }}>
                                    <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 'bold', color: '#2D1B4E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                        {category.name}
                                    </h4>
                                    <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '12px', color: '#4a5568', lineHeight: '1.5' }}>
                                        {selectedInCat.map((p, idx) => (
                                            <li key={`cat-p-${idx}`} style={{ marginBottom: '8px' }}>
                                                <span style={{ fontWeight: 'bold', color: p.type === 'Premium' ? '#E31E7A' : '#2D1B4E' }}>
                                                    {p.name} {p.type === 'Premium' && '★'}
                                                </span><br/>
                                                <span style={{ color: '#718096', fontSize: '11px' }} dangerouslySetInnerHTML={{ __html: p.desc }}></span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            );
                        })}
                    </div>
                </div>
                
                {/* Footer */}
                <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #ddd', textAlign: 'center', color: '#a0aec0', fontSize: '11px' }}>
                    <p style={{ margin: '0 0 5px 0' }}>This generated proposal is an estimated summary and does not constitute a binding legal agreement.</p>
                    <p style={{ margin: 0 }}>DEVCON Laguna Chapter — Contact: laguna@devcon.ph</p>
                </div>
            </div>
        </div>
    );
    const viewContent = showSummary ? (
        <div className="min-h-screen bg-gradient-to-br from-[#2D1B4E] to-[#91238C] text-white font-sans p-4 md:p-8">
            <div className="max-w-4xl mx-auto text-center mb-8 flex flex-col items-center">
                <img src="/logo.png" alt="DEVCON Laguna Logo" className="h-10 md:h-12 mx-auto mb-6 invert opacity-90 object-contain" />
                <div className="flex flex-col w-full justify-between items-start px-4 max-w-4xl">
                    <button onClick={() => setShowSummary(false)} className="text-[#E31E7A] hover:text-white font-medium mb-4 inline-flex items-center gap-2 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                        Back to Editor
                    </button>
                </div>
                <div className="flex flex-col md:flex-row gap-4 w-full justify-between items-center px-4 max-w-4xl mt-2">
                    <div className="text-left">
                        <h1 className="text-4xl font-bold text-white mb-2">Your Proposed Partnership</h1>
                        <p className="text-lg text-purple-200">Review your full sponsorship package below.</p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                        <input 
                            type="text"
                            placeholder="Enter Partner / Company Name *"
                            value={partnerName}
                            onChange={(e) => setPartnerName(e.target.value)}
                            className="bg-[#2A0F44] border border-white/20 text-white rounded-lg px-4 py-3 placeholder-white/50 focus:outline-none focus:border-[#E31E7A] focus:ring-2 focus:ring-[#E31E7A]/50 w-full sm:w-72 shadow-lg transition-all"
                            required
                        />
                        <button 
                            onClick={exportPDF}
                            disabled={isExporting}
                            className={`bg-[#E31E7A] hover:bg-[#C21864] text-white px-8 py-3 rounded-full font-bold text-sm shadow-xl shadow-[#E31E7A]/30 transition-all flex items-center gap-2 ${isExporting ? 'opacity-50 cursor-wait' : ''}`}
                        >
                            {isExporting ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                    Processing PDF...
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                                    Export Partnership Summary
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Display an overlay loading state while generating... so user clearly sees what's going on! */}
            {isExporting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#2D1B4E]/80 backdrop-blur-sm">
                    <div className="bg-[#3A1B5C] p-8 rounded-2xl shadow-2xl flex flex-col items-center border border-pink-500/30">
                        <svg className="animate-spin h-12 w-12 text-[#E31E7A] mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                        <h2 className="text-2xl font-bold text-white mb-2">Generating PDF Document</h2>
                        <p className="text-pink-300">Stitching your personalized sponsor package together...</p>
                    </div>
                </div>
            )}

            <div ref={summaryRef} className="max-w-4xl mx-auto bg-[#3A1B5C]/80 backdrop-blur-xl rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10">
                <div className="bg-[#2A0F44] text-white p-8">
                    <div className="flex flex-col md:flex-row justify-between items-center md:items-start gap-6">
                        <div>
                            <p className="text-pink-300 uppercase tracking-widest font-semibold text-sm mb-1">Partnership Level</p>
                            <h2 className="text-5xl font-black text-pink-300">{tiers[maxTier]} Sponsor</h2>
                            {partnerName && (
                                <h3 className="text-3xl font-semibold text-white mt-4">{partnerName}</h3>
                            )}
                            {bonusCategories > 0 && <p className="mt-2 inline-block bg-[#E31E7A] text-white text-xs font-bold px-3 py-1 rounded-full uppercase">Includes Multi-Role Bonus</p>}
                        </div>
                        <div className="text-right bg-[#1D0C30] p-4 rounded-xl shadow-inner min-w-[200px]">
                            <p className="text-pink-300 text-xs font-semibold uppercase mb-1">Impact Areas</p>
                            <p className="text-2xl font-bold">{activeCount} Roles</p>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    <div className="mb-10">
                        <h3 className="text-2xl font-bold text-white border-b-2 border-white/10 pb-3 mb-6">1. Your Contributions (The Give)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(selections).filter(([_, level]) => level > 0 && selectedRoles[_]).map(([roleId, level]) => {
                                const role = rolesData.find(r => r.id === roleId)!;
                                return (
                                    <div key={roleId} className="bg-white/5 border border-white/10 rounded-lg p-4 bg-transparent">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold text-white">{role.name}</h4>
                                            <span className="text-xs font-bold bg-[#E31E7A] text-white shadow-lg shadow-[#E31E7A]/40 px-2 py-1 rounded uppercase">{tiers[level]}</span>
                                        </div>
                                        <ul className="text-sm text-purple-200 space-y-1">
                                            {role.tiers[level as keyof typeof role.tiers].map((detail, idx) => (
                                                <li key={idx} className="flex"><span className="text-pink-400 mr-2">✔</span> <span dangerouslySetInnerHTML={{ __html: detail }}></span></li>
                                            ))}
                                        </ul>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mb-10">
                        <h3 className="text-2xl font-bold text-white border-b-2 border-white/10 pb-3 mb-6">2. Base Benefits (The Take)</h3>
                        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {autoBenefits[maxTier].map((b, i) => (
                                    <li key={i} className="flex items-start bg-white/5 p-3 rounded-lg shadow-sm border border-white/10">
                                        <span className="text-pink-400 mr-3 text-lg mt-0.5">★</span> 
                                        <span className="font-medium text-white">{b}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-2xl font-bold text-white border-b-2 border-white/10 pb-3 mb-6">3. Your Custom Perks (The Take)</h3>
                        {Object.values(selectedPerks).some(Boolean) ? (
                            <div className="space-y-4">
                                {Object.entries(selectedPerks)
                                    .filter(([_, isSelected]) => isSelected)
                                    .map(([perkName]) => {
                                        // Find perk description
                                        let isPremium = false;
                                        let desc = '';
                                        perkCategories.forEach(cat => {
                                            const std = cat.standard.find(p => p.name === perkName);
                                            const prem = cat.premium.find(p => p.name === perkName);
                                            if (std) desc = std.desc;
                                            if (prem) { desc = prem.desc; isPremium = true; }
                                        });
                                        
                                        return (
                                            <div key={perkName} className={`p-4 rounded-xl border ${isPremium ? 'bg-[#91238C]/30 border-[#E31E7A]' : 'bg-transparent border-white/10'} flex items-start gap-4`}>
                                                <div className={`mt-1 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isPremium ? 'bg-[#E31E7A] text-white shadow-[0_0_10px_rgba(227,30,122,0.5)]' : 'bg-white/10 text-pink-300 border border-white/20'}`}>
                                                    {isPremium ? '★' : '✓'}
                                                </div>
                                                <div>
                                                    <h4 className={`font-bold ${isPremium ? 'text-pink-300' : 'text-white'}`}>{isPremium ? 'Premium: ' : ''}{perkName}</h4>
                                                    <p className="text-sm text-purple-200 mt-1">{desc}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                            </div>
                        ) : (
                            <p className="text-purple-300/[0.8] italic bg-transparent p-6 rounded-lg text-center">No custom perks selected yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <div className="min-h-screen bg-gradient-to-br from-[#2D1B4E] to-[#91238C] text-white font-sans p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <header className="mb-10 text-center">
                    <img src="/logo.png" alt="DEVCON Laguna Logo" className="h-12 md:h-16 mx-auto mb-6 invert opacity-90 object-contain" />
                    <h1 className="text-4xl font-bold text-white mb-2">Sponsorship Simulator</h1>
                    <p className="text-lg text-purple-200">Simulate your Give and Take partnership package</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
                    <div className="lg:col-span-1 space-y-8">
                        {/* Step 1: Select Roles */}
                        <div className="bg-[#3A1B5C]/80 backdrop-blur-md p-6 rounded-xl shadow-2xl border border-white/10">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#E31E7A] text-white shadow-lg shadow-[#E31E7A]/40 font-bold text-lg">1</span>
                                <h2 className="text-2xl font-bold">Select Sponsorship Categories</h2>
                            </div>
                            <p className="text-sm text-purple-300/[0.8] mb-6 md:pl-11">
                                What areas would you like to support? <strong className="text-pink-300">You can select more than one!</strong>
                            </p>
                            
                            <div className="space-y-6 md:pl-11">
                                {Array.from(new Set(rolesData.map(r => r.category))).map(category => (
                                    <div key={category} className="space-y-3">
                                        <h3 className="text-xs font-bold text-pink-300 uppercase tracking-widest border-b border-white/10 pb-1 inline-block">{category}</h3>
                                        <div className="flex flex-wrap gap-3">
                                            {rolesData.filter(r => r.category === category).map(role => (
                                                <div key={role.id} className="flex flex-col mb-1 group relative">
                                                    <button
                                                        onClick={() => toggleRole(role.id)}
                                                        className={`px-4 py-2 rounded-full border text-sm font-medium transition-colors shadow-sm ${
                                                            selectedRoles[role.id] 
                                                                ? 'bg-[#E31E7A] text-white border-[#E31E7A]' 
                                                                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                                                        }`}
                                                    >
                                                        {role.name}
                                                    </button>
                                                    <div className="hidden group-hover:block absolute bottom-full mb-2 w-64 p-2 bg-[#2A0F44] text-white text-xs rounded shadow-xl z-20 before:content-[''] before:absolute before:top-full before:left-1/2 before:-ml-2 before:border-4 before:border-transparent before:border-t-[#2A0F44] pointer-events-none">
                                                        {role.description}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Step 2: Choose Tiers inside Categories */}
                        {Object.keys(selectedRoles).some(k => selectedRoles[k]) && (
                            <div className="bg-[#3A1B5C]/80 backdrop-blur-md p-6 rounded-xl shadow-2xl border border-white/10">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#E31E7A] text-white shadow-lg shadow-[#E31E7A]/40 font-bold text-lg">2</span>
                                    <h2 className="text-2xl font-bold">Choose Contribution Tiers</h2>
                                </div>
                                <p className="text-sm text-purple-300/[0.8] mb-6 md:pl-11">
                                    Review the detailed responsibilities below and select your preferred tier for each category.
                                </p>
                                
                                <div className="space-y-8 md:pl-11">
                                    {rolesData.filter(r => selectedRoles[r.id]).map(role => (
                                        <div key={role.id} className="border border-white/10 rounded-lg overflow-hidden shadow-sm">
                                            <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center">
                                                <div>
                                                    <h3 className="text-lg font-bold text-white">{role.name}</h3>
                                                    <p className="text-xs text-[#E31E7A] uppercase tracking-widest">{role.category}</p>
                                                </div>
                                            </div>
                                            <div className="p-4 bg-transparent">
                                                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                                    {[1, 2, 3].map(level => {
                                                        const tierName = tiers[level];
                                                        const isSelected = selections[role.id] === level;
                                                        return (
                                                            <div 
                                                                key={level}
                                                                onClick={() => handleSelectionChange(role.id, level)}
                                                                className={`cursor-pointer border rounded-lg p-4 transition-all relative flex flex-col ${
                                                                    isSelected 
                                                                        ? 'border-blue-500 bg-white/5 ring-2 ring-blue-500 shadow-md' 
                                                                        : 'border-white/10 hover:border-[#E31E7A] hover:bg-white/10'
                                                                }`}
                                                            >
                                                                <div className="flex items-center justify-between mb-3 border-b border-white/10 md:border-b-0 pb-2 md:pb-0">
                                                                    <span className="font-bold text-white">{tierName} Tier</span>
                                                                    <input 
                                                                        type="radio" 
                                                                        readOnly
                                                                        checked={isSelected}
                                                                        className="w-4 h-4 text-[#E31E7A]"
                                                                    />
                                                                </div>
                                                                <ul className="text-sm text-purple-200 space-y-2 mt-2">
                                                                    {role.tiers[level as keyof typeof role.tiers].map((detail, idx) => (
                                                                        <li key={idx} className="flex">
                                                                            <span className="text-pink-400 mr-2 text-xs mt-1">✔</span>
                                                                            <span dangerouslySetInnerHTML={{ __html: detail }}></span>
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Base Benefits (Automatic) */}
                        {maxTier > 0 && (
                            <div className="bg-[#3A1B5C]/80 backdrop-blur-md p-6 rounded-xl shadow-2xl border border-white/10">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#E31E7A] text-white shadow-lg shadow-[#E31E7A]/40 font-bold text-lg">3</span>
                                    <h2 className="text-2xl font-bold">Automatic Base Benefits</h2>
                                </div>
                                <p className="text-sm text-purple-300/[0.8] mb-6 md:pl-11">
                                    By selecting at least one role at the <strong className="text-pink-300">{tiers[maxTier]}</strong> tier, you automatically receive these baseline benefits. No picking required!
                                </p>
                                
                                <div className="md:pl-11">
                                    <div className="bg-white/5 p-6 rounded-xl border border-white/10">
                                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {autoBenefits[maxTier].map((b, i) => (
                                                <li key={i} className="flex items-start bg-white/5 p-3 rounded-lg shadow-sm border border-white/10">
                                                    <span className="text-pink-400 mr-3 text-lg mt-0.5">★</span> 
                                                    <span className="font-medium text-white">{b}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Pick Custom Perks */}
                        {maxTier > 0 && (
                            <div className="bg-[#3A1B5C]/80 backdrop-blur-md p-6 rounded-xl shadow-2xl border border-white/10">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#E31E7A] text-white shadow-lg shadow-[#E31E7A]/40 font-bold text-lg">4</span>
                                    <h2 className="text-2xl font-bold">Pick Custom Perks</h2>
                                </div>
                                <p className="text-sm text-purple-300/[0.8] mb-6 md:pl-11">
                                    Use your Customization Allowance (shown on the right) to build your ultimate custom package.<br/>
                                    <strong>Rules:</strong> Standard Perks can be flexibly assigned across your chosen categories up to your tier limit. Premium perks MUST be picked from your active categories.
                                </p>

                                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 md:pl-11">
                                        {perkCategories.map((category, idx) => {
                                        const catStats = categoryStats.find(c => c.name === category.name)!;
                                        const cIsActive = catStats.total > 0;
                                        // Determine if user can select standard in this category
                                        // Block if globally capped, OR if max categories reached and this one isn't active
                                        const cStdBlocked = (!cIsActive && categoryLimitReached) || standardGlobalLimitReached;
                                        
                                        // Determine if user can select premium in this category
                                        // For Major Tier (Tier 2), maximum of 1 premium pick per category
                                        const maxPremPerCat = maxTier === 2 ? 1 : 2;
                                        const cPremBlocked = maxTier < 2 || premiumGlobalLimitReached || (!cIsActive && categoryLimitReached) || catStats.premCount >= maxPremPerCat;

                                        return (
                                        <div key={idx} className={`border rounded-xl p-6 transition-all ${cIsActive ? 'border-[#E31E7A] bg-transparent shadow-2xl ring-2 ring-[#E31E7A]/50' : 'border-white/10 bg-black/10'}`}>
                                            <h3 className="font-bold text-white mb-4 text-xl border-b border-white/10 pb-3">{category.name} {cIsActive && <span className="ml-2 text-xs bg-[#E31E7A]/30 text-white px-2.5 py-1 rounded-full uppercase tracking-widest">Active Choice</span>}</h3>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="text-xs font-semibold text-pink-300 uppercase tracking-widest">Standard Perks</h4>
                                                        <div className="flex gap-1 items-center">
                                                            <span className="text-[10px] font-medium bg-[#E31E7A] text-white shadow-lg shadow-[#E31E7A]/40 px-1.5 py-0.5 rounded-full">{totalStandardSelected} / {allowedStandard} Total</span>
                                                            <span className="text-[10px] font-medium bg-[#E31E7A] text-white shadow-lg shadow-[#E31E7A]/40 px-1.5 py-0.5 rounded-full">{catStats.stdCount} Selected Here</span>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        {category.standard.map(perk => {
                                                            const isSelected = !!selectedPerks[perk.name];
                                                            const isBlocked = !isSelected && cStdBlocked;
                                                            return (
                                                            <label key={perk.name} className={`relative flex items-start gap-3 p-3 rounded-lg border-2 transition-all select-none ${
                                                                isSelected 
                                                                    ? 'border-[#E31E7A] bg-white/5 shadow-sm' 
                                                                    : isBlocked 
                                                                        ? 'border-white/5 bg-transparent opacity-40 cursor-not-allowed' 
                                                                        : 'border-white/10 bg-white/5 hover:border-[#E31E7A] hover:bg-white/10 cursor-pointer'
                                                            }`}>
                                                                <input 
                                                                    type="checkbox" 
                                                                    disabled={isBlocked}
                                                                    className="sr-only"
                                                                    checked={isSelected}
                                                                    onChange={() => togglePerk(perk.name)}
                                                                />
                                                                <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-[#E31E7A] border-[#E31E7A] text-white' : 'border-white/30 bg-black/20'}`}>
                                                                    {isSelected && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>}
                                                                </div>
                                                                <div className={`text-sm ${isBlocked ? 'text-purple-300/[0.8]' : 'text-purple-100'}`}>
                                                                    <span className="font-semibold block text-white">{perk.name}</span>
                                                                    <span className="text-xs text-purple-300/[0.8] font-normal leading-tight mt-1 inline-block">{perk.desc}</span>
                                                                </div>
                                                            </label>
                                                        )})}
                                                    </div>
                                                </div>

                                                <div>
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="text-xs font-semibold text-purple-700 uppercase tracking-widest flex items-center gap-1">
                                                            Premium Perks (★)
                                                            {maxTier < 2 && <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-[10px]">Major/Lead Only</span>}
                                                        </h4>
                                                        <div className="flex gap-1 items-center">
                                                            {maxTier >= 2 && <span className="text-[10px] font-medium bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded-full">{totalPremiumSelected} / {allowedPremium} Total</span>}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        {category.premium.map(perk => {
                                                            const isSelected = !!selectedPerks[perk.name];
                                                            const isBlocked = (!isSelected && cPremBlocked) || maxTier < 2;
                                                            return (
                                                            <label key={perk.name} className={`relative flex items-start gap-3 p-3 rounded-lg border-2 transition-all select-none ${
                                                                isSelected 
                                                                    ? 'border-purple-500 bg-purple-500/20 shadow-[0_0_10px_rgba(168,85,247,0.2)]' 
                                                                    : isBlocked 
                                                                        ? 'border-white/5 bg-transparent opacity-40 cursor-not-allowed' 
                                                                        : 'border-white/10 bg-white/5 hover:border-[#91238C] hover:bg-white/10 cursor-pointer'
                                                            }`}>
                                                                <input 
                                                                    type="checkbox" 
                                                                    disabled={isBlocked}
                                                                    className="sr-only"
                                                                    checked={isSelected}
                                                                    onChange={() => togglePerk(perk.name)}
                                                                />
                                                                <div className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded border flex items-center justify-center ${isSelected ? 'bg-purple-600 border-purple-600 text-white' : 'border-white/30 bg-black/20'}`}>
                                                                    {isSelected && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>}
                                                                </div>
                                                                <div className={`text-sm ${isBlocked ? 'text-purple-300/[0.8]' : 'text-purple-100'}`}>
                                                                    <span className="font-semibold block text-white">★ {perk.name}</span>
                                                                    <span className="text-xs text-purple-300/[0.8] font-normal leading-tight mt-1 inline-block">{perk.desc}</span>
                                                                </div>
                                                            </label>
                                                        )})}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )})}
                                </div>
                                <div className="mt-8 pt-6 border-t border-white/10 flex justify-end">
                                    <button 
                                        onClick={() => setShowSummary(true)}
                                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1"
                                    >
                                        Save & Generate Package Summary
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <>
            {viewContent}
            {pdfExportTemplate}
        </>
    );
}

