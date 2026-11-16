function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <p>© {new Date().getFullYear()} GymLog</p>
        <p>
          Exercise data from{' '}
          <a href="https://wger.de" target="_blank" rel="noreferrer">
            wger Workout Manager
          </a>{' '}
          (CC-BY-SA)
        </p>
      </div>
    </footer>
  );
}

export default Footer;
