import pt from 'date-fns/locale/pt';
import { format, parseISO } from 'date-fns';
import Mail from '../../lib/Mail';

class CancellationMail {
  get key() {
    return 'CancellationMail';
  }

  async handle({ data }) {
    const { meetup } = data;

    await Mail.sendMail({
      to: `${meetup.user.name} <${meetup.user.email}`,
      subject: 'Meetup cancelado',
      template: 'cancellation',
      context: {
        name: meetup.user.name,
        date: format(parseISO(meetup.date), "dd 'de' MMMM', às' H:mm'h'", {
          locale: pt,
        }),
      },
    });
  }
}

export default new CancellationMail();
