import React from "react";

const Footer = () => {
  return (
    <footer className="bg-navy-900 text-white py-10 px-6 md:px-20 mt-20">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Company Info */}
        <div>
          <h2 className="text-2xl font-bold text-primary-400 mb-4">SympFindX</h2>
          <p className="text-navy-300 text-sm leading-relaxed">
            Empowering healthcare through advanced AI technology. SympFindX
            helps detect and analyze symptoms with accuracy and efficiency.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-semibold text-primary-400 mb-4">
            Quick Links
          </h3>
          <ul className="space-y-2">
            <li>
              <a
                href="/about"
                className="text-navy-300 hover:text-primary-400 transition-colors duration-300"
              >
                About Us
              </a>
            </li>
            <li>
              <a
                href="/services"
                className="text-navy-300 hover:text-primary-400 transition-colors duration-300"
              >
                Services
              </a>
            </li>
            <li>
              <a
                href="/contact"
                className="text-navy-300 hover:text-primary-400 transition-colors duration-300"
              >
                Contact
              </a>
            </li>
            <li>
              <a
                href="/faq"
                className="text-navy-300 hover:text-primary-400 transition-colors duration-300"
              >
                FAQ
              </a>
            </li>
          </ul>
        </div>

        {/* Resources */}
        <div>
          <h3 className="text-lg font-semibold text-primary-400 mb-4">
            Resources
          </h3>
          <ul className="space-y-2">
            <li>
              <a
                href="/blog"
                className="text-navy-300 hover:text-primary-400 transition-colors duration-300"
              >
                Blog
              </a>
            </li>
            <li>
              <a
                href="/guides"
                className="text-navy-300 hover:text-primary-400 transition-colors duration-300"
              >
                Guides
              </a>
            </li>
            <li>
              <a
                href="/support"
                className="text-navy-300 hover:text-primary-400 transition-colors duration-300"
              >
                Support
              </a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-lg font-semibold text-primary-400 mb-4">
            Get in Touch
          </h3>
          <p className="text-navy-300 text-sm mb-2">support@sympfindx.com</p>
          <p className="text-navy-300 text-sm mb-2">+1 234 567 890</p>
          <div className="flex space-x-4 mt-4">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy-300 hover:text-primary-400 transition-colors duration-300"
            >
              Facebook
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy-300 hover:text-primary-400 transition-colors duration-300"
            >
              Twitter
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-navy-300 hover:text-primary-400 transition-colors duration-300"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="mt-10 border-t border-navy-700 pt-6 flex flex-col md:flex-row justify-between items-center">
        <p className="text-navy-400 text-sm">
          © {new Date().getFullYear()} SympFindX. All rights reserved.
        </p>
        <div className="flex space-x-6 text-sm">
          <a
            href="/privacy-policy"
            className="text-navy-400 hover:text-primary-400 transition-colors duration-300"
          >
            Privacy Policy
          </a>
          <a
            href="/terms-of-service"
            className="text-navy-400 hover:text-primary-400 transition-colors duration-300"
          >
            Terms of Service
          </a>
          <a
            href="/medical-disclaimer"
            className="text-navy-400 hover:text-primary-400 transition-colors duration-300"
          >
            Medical Disclaimer
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
