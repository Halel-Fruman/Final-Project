import React from "react";

const Footer = () => {
  return (
    <footer id="g-footer" className="bg-gray-100 py-8">
      <div className="g-container mx-auto">
        <div className="g-grid grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* אודותינו */}
          <div className="g-block title-border p-4 lg:pl-16">
            <h3 className="text-xl font-bold mb-4">אודותינו</h3>
            <p>
              עמותת איל"ן היא מהעמותות הוותיקות בארץ, שפועלת ליצירת מערכי
              תמיכה לשילוב ילדים ובוגרים עם מוגבלויות, כעצמאיים ושווים בחברה
              הישראלית הכללית. בחזונה, מאמינה איל"ן במתן חיים משמעותיים ואיכותיים
              לאנשים עם מוגבלויות פיזית.
            </p>
          </div>

          {/* עקבו אחרינו */}
          <div className="g-block title-border p-4">
            <h3 className="text-xl font-bold mb-4">עקבו אחרינו</h3>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/Ilan.Foundation/?locale=he_IL"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <i className="fa fa-facebook fa-2x text-blue-600"></i>
              </a>
              <a
                href="https://www.instagram.com/ilan_association/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <i className="fa fa-instagram fa-2x text-pink-500"></i>
              </a>
              <a
                href="https://www.linkedin.com/company/ilan-il/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Linkedin"
              >
                <i className="fa fa-linkedin fa-2x text-blue-800"></i>
              </a>
              <a
                href="https://www.youtube.com/@ilanisrael"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <i className="fa fa-youtube fa-2x text-red-600"></i>
              </a>
            </div>
          </div>

          {/* פרטי קשר */}
          <div className="g-block title-border p-4">
            <h3 className="text-xl font-bold mb-4">פרטי קשר</h3>
            <div className="space-y-4">
              <div>
                <a
                  href="mailto:ilan@ilan-israel.co.il"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fa fa-envelope-o"></i> ilan@ilan-israel.co.il
                </a>
              </div>
              <div>
                <a href="tel:03-5248141">
                  <i className="fa fa-phone"></i> 03-5248141
                </a>
              </div>
              <div>
                <i className="fa fa-fax"></i> 03-5249828
              </div>
              <div>
                <i className="fa fa-home"></i> רח' מוטה גור 5, ת.ד 3092, פתח תקווה
                4951623
              </div>
            </div>
          </div>
        </div>

        <div className="g-grid mt-8 text-center">
          <p className="text-black text-sm">
            © {new Date().getFullYear()} עמותת איל"ן. כל הזכויות שמורות.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
