import { useState } from 'react';

export default function TermsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#1a1a1a',
          borderRadius: '12px',
          maxWidth: '700px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto',
          padding: '32px',
          position: 'relative',
          border: '1px solid rgba(255, 107, 107, 0.2)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '8px',
            lineHeight: 1
          }}
        >
          ×
        </button>

        <h2 style={{ color: '#ff6b6b', marginTop: 0, marginBottom: '24px', fontSize: '24px', textAlign: 'center' }}>
          Terms and Conditions
        </h2>

        <div style={{ color: 'rgba(255, 255, 255, 0.85)', lineHeight: '1.6', fontSize: '14px' }}>
          <p style={{ marginBottom: '16px' }}>
            <strong>Effective Date:</strong> February 11, 2026
          </p>

          <h3 style={{ color: '#ff6b6b', fontSize: '18px', marginTop: '24px', marginBottom: '12px' }}>
            1. Data Collection and Use
          </h3>
          <p style={{ marginBottom: '12px' }}>
            By using RedditUser.info, you consent to the collection, analysis, and storage of publicly available 
            Reddit data associated with the username you submit. We collect and analyze:
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
            <li>Public Reddit posts and comments</li>
            <li>Subreddit activity patterns</li>
            <li>Posting timestamps and engagement metrics</li>
            <li>Linguistic and behavioral patterns derived from your content</li>
          </ul>

          <h3 style={{ color: '#ff6b6b', fontSize: '18px', marginTop: '24px', marginBottom: '12px' }}>
            2. Data Harvesting and Commercial Use
          </h3>
          <p style={{ marginBottom: '12px' }}>
            <strong>We harvest and may sell your data.</strong> RedditUser.info collects user data for the following purposes:
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
            <li><strong>Analysis and Research:</strong> Understanding user behavior, trends, and patterns</li>
            <li><strong>Commercial Sale:</strong> Aggregated and anonymized datasets may be sold to third parties for research, marketing, or analytical purposes</li>
            <li><strong>Service Improvement:</strong> Enhancing our algorithms and widget accuracy</li>
            <li><strong>Statistical Reporting:</strong> Creating aggregate reports and insights</li>
          </ul>

          <h3 style={{ color: '#ff6b6b', fontSize: '18px', marginTop: '24px', marginBottom: '12px' }}>
            3. Data Anonymization
          </h3>
          <p style={{ marginBottom: '16px' }}>
            We anonymize your data to the best of our capabilities before any commercial use or sale. However, 
            we cannot guarantee complete anonymity, as Reddit usernames and content are inherently public. 
            When aggregating data for sale or research, we employ industry-standard anonymization techniques 
            including data masking, aggregation, and removal of direct identifiers.
          </p>

          <h3 style={{ color: '#ff6b6b', fontSize: '18px', marginTop: '24px', marginBottom: '12px' }}>
            4. Account Ownership Verification
          </h3>
          <p style={{ marginBottom: '16px' }}>
            By checking the consent box, you confirm that:
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
            <li>The Reddit account being analyzed is <strong>YOUR OWN ACCOUNT</strong></li>
            <li>You are not analyzing someone else's account without their explicit permission</li>
            <li>You have the legal right to consent to the analysis of this account's data</li>
          </ul>
          <p style={{ marginBottom: '16px', color: '#ff6b6b' }}>
            <strong>Unauthorized use is strictly prohibited.</strong> Analyzing another person's account without 
            their consent may violate privacy laws and Reddit's Terms of Service.
          </p>

          <h3 style={{ color: '#ff6b6b', fontSize: '18px', marginTop: '24px', marginBottom: '12px' }}>
            5. Limitation of Liability
          </h3>
          <p style={{ marginBottom: '16px' }}>
            RedditUser.info is <strong>not responsible for unauthorized use</strong> of our service, including but not limited to:
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
            <li>Analysis of accounts by individuals who do not own those accounts</li>
            <li>Misuse of analysis results for harassment, stalking, or malicious purposes</li>
            <li>Third-party breaches or unauthorized access to our systems</li>
            <li>Any damages arising from the use or misuse of data obtained through our service</li>
          </ul>
          <p style={{ marginBottom: '16px' }}>
            Users who violate these terms or engage in unauthorized use are solely responsible for their actions 
            and any legal consequences.
          </p>

          <h3 style={{ color: '#ff6b6b', fontSize: '18px', marginTop: '24px', marginBottom: '12px' }}>
            6. IP Address Logging and Security
          </h3>
          <p style={{ marginBottom: '16px' }}>
            We log IP addresses and usage metadata to:
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
            <li>Prevent abuse and improper use of our service</li>
            <li>Hold users accountable for violations of these terms</li>
            <li>Cooperate with law enforcement in cases of illegal activity</li>
            <li>Enforce rate limiting and prevent automated abuse</li>
          </ul>
          <p style={{ marginBottom: '16px' }}>
            IP address logs may be retained for up to 12 months and may be disclosed to authorities if required 
            by law or in cases of suspected unauthorized use.
          </p>

          <h3 style={{ color: '#ff6b6b', fontSize: '18px', marginTop: '24px', marginBottom: '12px' }}>
            7. Opt-Out and Data Removal
          </h3>
          <p style={{ marginBottom: '12px' }}>
            If you do not want your data analyzed or included in our portal, you have the right to opt out:
          </p>
          <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
            <li>
              <strong>Before Analysis:</strong> Simply do not submit your username for analysis
            </li>
            <li>
              <strong>After Analysis:</strong> Use our{' '}
              <a href="#contact" style={{ color: '#ff6b6b', cursor: 'pointer' }} onClick={(e) => { e.preventDefault(); onClose(); document.querySelector('[data-contact-support]')?.click(); }}>
                contact form
              </a>
              {' '}to request data removal
            </li>
            <li>
              Include your Reddit username and a verification method (e.g., a Reddit comment mentioning 
              your removal request)
            </li>
          </ul>
          <p style={{ marginBottom: '16px' }}>
            Upon receiving a valid removal request, we will remove your personal analysis from our public portal 
            within 30 days. However, anonymized aggregate data that has already been sold or distributed cannot 
            be retrieved.
          </p>

          <h3 style={{ color: '#ff6b6b', fontSize: '18px', marginTop: '24px', marginBottom: '12px' }}>
            8. Changes to Terms
          </h3>
          <p style={{ marginBottom: '16px' }}>
            We reserve the right to modify these terms at any time. Continued use of the service after changes 
            constitutes acceptance of the revised terms. Material changes will be indicated by updating the 
            "Effective Date" at the top of this document.
          </p>

          <h3 style={{ color: '#ff6b6b', fontSize: '18px', marginTop: '24px', marginBottom: '12px' }}>
            9. Contact Information
          </h3>
          <p style={{ marginBottom: '16px' }}>
            For questions, concerns, or data removal requests, please use our{' '}
            <a href="#contact" style={{ color: '#ff6b6b', cursor: 'pointer' }} onClick={(e) => { e.preventDefault(); onClose(); document.querySelector('[data-contact-support]')?.click(); }}>
              contact form
            </a>.
          </p>
          <p style={{ marginBottom: '16px' }}>
            <strong>Website:</strong>{' '}
            <a href="https://reddituser.info" style={{ color: '#ff6b6b' }}>
              https://reddituser.info
            </a>
          </p>

          <div
            style={{
              marginTop: '32px',
              padding: '16px',
              backgroundColor: 'rgba(255, 107, 107, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 107, 107, 0.3)'
            }}
          >
            <p style={{ margin: 0, fontSize: '13px', lineHeight: '1.5' }}>
              <strong>By checking the consent box, you acknowledge that you have read, understood, and agree 
              to these Terms and Conditions.</strong> You confirm that you own the account being analyzed and 
              consent to data collection, analysis, anonymization, and potential commercial use as described above.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: '24px',
            width: '100%',
            padding: '12px',
            backgroundColor: '#ff6b6b',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background-color 0.2s'
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#ff5252')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#ff6b6b')}
        >
          Close
        </button>
      </div>
    </div>
  );
}
