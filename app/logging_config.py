import logging
from colorama import init, Fore, Style

init(autoreset=True)

class ColorfulFormatter(logging.Formatter):
    LEVEL_COLORS = {
        logging.DEBUG:    Fore.CYAN,
        logging.INFO:     Fore.GREEN,
        logging.WARNING:  Fore.YELLOW,
        logging.ERROR:    Fore.RED,
        logging.CRITICAL: Fore.MAGENTA,
    }
    def format(self, record):
        color = self.LEVEL_COLORS.get(record.levelno, "")
        msg = super().format(record)
        return f"{color}{msg}{Style.RESET_ALL}"

def get_logger(name=__name__, level=logging.INFO):
    handler = logging.StreamHandler()
    handler.setFormatter(
        ColorfulFormatter("%(asctime)s %(levelname)s: %(message)s", datefmt="%H:%M:%S")
    )
    logger = logging.getLogger(name)
    logger.setLevel(level)
    if not logger.handlers:
        logger.addHandler(handler)
    return logger
