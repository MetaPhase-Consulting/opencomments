import React, { useRef, useCallback } from 'react';
import HCaptcha from '@hcaptcha/react-hcaptcha';

interface HCaptchaComponentProps {
  onVerify: (token: string) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
  size?: 'normal' | 'compact';
  theme?: 'light' | 'dark';
}

const HCaptchaComponent: React.FC<HCaptchaComponentProps> = ({
  onVerify,
  onError,
  onExpire,
  size = 'normal',
  theme = 'light'
}) => {
  const captchaRef = useRef<HCaptcha>(null);
  const siteKey = import.meta.env.VITE_HCAPTCHA_SITE_KEY;

  const handleVerify = useCallback((token: string) => {
    onVerify(token);
  }, [onVerify]);

  const handleError = useCallback((error: string) => {
    console.error('hCaptcha error:', error);
    onError?.(error);
  }, [onError]);

  const handleExpire = useCallback(() => {
    console.warn('hCaptcha token expired');
    onExpire?.();
  }, [onExpire]);

  const resetCaptcha = useCallback(() => {
    captchaRef.current?.resetCaptcha();
  }, []);

  if (!siteKey) {
    console.warn('VITE_HCAPTCHA_SITE_KEY not found in environment variables');
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-600">
          CAPTCHA is not configured. Please contact support if this issue persists.
        </p>
      </div>
    );
  }

  return (
    <div className="flex justify-center">
      <HCaptcha
        ref={captchaRef}
        sitekey={siteKey}
        onVerify={handleVerify}
        onError={handleError}
        onExpire={handleExpire}
        size={size}
        theme={theme}
      />
    </div>
  );
};

export default HCaptchaComponent;
export { HCaptchaComponent };