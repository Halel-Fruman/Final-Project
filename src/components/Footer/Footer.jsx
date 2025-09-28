import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faPhone, faFax, faHome } from '@fortawesome/free-solid-svg-icons';
import '@fortawesome/fontawesome-svg-core/styles.css'; // Import FontAwesome styles
const Footer = () => {
  return (

    <footer className="bg-gray-100 py-8 mt-auto text-right">
      <div className="w-auto mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* About Us */}
          <div className="p-4 order-0 border-b lg:border-b-0 lg:border-l border-gray-300 lg:order-none">
            <h3 className="text-xl font-bold mb-4">אודותינו</h3>
            <p className="text-gray-700 text-sm leading-relaxed">
              עמותת איל"ן היא מהעמותות הוותיקות בארץ, שפועלת ליצירת מערכי תמיכה
              לשילוב ילדים ובוגרים עם מוגבלויות, כעצמאיים ושווים בחברה הישראלית
              הכללית. בחזונה, מאמינה איל"ן במתן חיים משמעותיים ואיכותיים לאנשים
              עם מוגבלויות פיזית.
            </p>
          </div>

          {/* Social Media */}
          <div className="p-4 border-b lg:border-b-0 lg:border-l border-gray-300 text-center order-0 lg:order-none">
            <h3 className="text-xl font-bold mb-4">עקבו אחרינו</h3>
            <div className="flex justify-center gap-6">
              <a
                href="https://www.youtube.com/@ilanisrael"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube">
                <i className="fa fa-youtube fa-5x text-red-600 hover:scale-110 transition-transform"></i>
              </a>
              <a
                href="https://www.linkedin.com/company/ilan-il/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Linkedin">
                <i className="fa fa-linkedin fa-5x text-blue-800 hover:scale-110 transition-transform"></i>
              </a>
              <a
                href="https://www.instagram.com/ilan_association/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram">
                <i className="fa fa-instagram fa-5x text-pink-500 hover:scale-110 transition-transform"></i>
              </a>
              <a
                href="https://www.facebook.com/Ilan.Foundation/?locale=he_IL"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook">
                <i className="fa fa-facebook fa-5x text-blue-600 hover:scale-110 transition-transform"></i>
              </a>
            </div>
          </div>
          {/* Contact Info */}
          <div className="p-4  order-1 lg:order-none">
            <h3 className="text-xl font-bold mb-4">פרטי קשר</h3>
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <a
                  href="mailto:ilan@ilan-israel.co.il"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline">
                  <i className="fa fa-envelope-o ml-2"></i>
                  ilan@ilan-israel.co.il
                </a>
              </div>
              <div>
                <a href="tel:03-5248141" className="hover:underline">
                  <i className="fa fa-phone ml-2"></i>
                  03-5248141
                </a>
              </div>
              <div>
                <i className="fa fa-fax ml-2"></i>
                03-5249828
              </div>
              <div>
                <i className="fa fa-home ml-2"></i>
                רח' מוטה גור 5, ת.ד 3092, פתח תקווה 4951623
              </div>
            </div>
          </div>
        </div>

        {/* Footer bottom */}
        <div className="mt-8 text-center">
          <p className="text-black text-sm">
            © {new Date().getFullYear()} עמותת איל"ן. כל הזכויות שמורות.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
