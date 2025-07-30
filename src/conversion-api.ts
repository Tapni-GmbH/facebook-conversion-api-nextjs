import { v4 as uuidv4 } from 'uuid';
import debug from './utils/debug';
import { FBEvent } from './types';
import Cookies from 'universal-cookie';

declare global {
  interface Window {
    fbq: any;
  }
}

/**
 * Trigger Facebook PageView Event (Standard Pixel).
 *
 * @constructor
 */
const fbPageView = (): void => {
  if (typeof window === 'undefined') {
    return;
  }
  debug('Client Side Event: PageView');

  window.fbq('track', 'PageView');
};

/**
 * Trigger custom Facebook Event (Conversion API and optionally Standard Pixel).
 *
 * @param event
 * @constructor
 */
const fbEvent = (event: FBEvent): void => {
  if (typeof window === 'undefined') {
    return;
  }
  const eventId = event.eventId ? event.eventId : uuidv4();
  const cookies = new Cookies();
  const fbp = cookies.get('_fbp');
  const fbc = cookies.get('_fbc');

  if (event.enableStandardPixel) {
    const clientSidePayload = {
      ...(event?.products && event.products.length > 0) && {
        content_type: 'product',
        contents: event.products.map((product) => (
          {
            id: product.sku,
            quantity: product.quantity,
          }
        )),
      },
      ...(event.value && { value: event.value }),
      ...(event.currency && { currency: event.currency }),
    };

    window.fbq('track', event.eventName, clientSidePayload, { eventID: eventId, ...(fbp && { fbp }), ...(fbc && { fbc }) });

    debug(`Client Side Event: ${event.eventName}`);
    debug(`Client Side Payload: ${JSON.stringify(clientSidePayload)}`);
    debug(`Client Side Event ID: ${eventId}`);
  }

  setTimeout(() => {
    const serverSidePayload = JSON.stringify({
      eventName: event.eventName,
      eventId,
      emails: event.emails,
      phones: event.phones,
      firstName: event.firstName,
      lastName: event.lastName,
      country: event.country,
      city: event.city,
      zipCode: event.zipCode,
      products: event.products,
      value: event.value,
      currency: event.currency,
      fbp,
      fbc,
      userAgent: navigator.userAgent,
      sourceUrl: window.location.href,
      testEventCode: event.testEventCode,
    });

    fetch('/api/fb-events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: serverSidePayload,
    }).then((response) => {
      debug(`Server Side Event: ${event.eventName} (${response.status})`);
      debug(`Server Side Payload: ${serverSidePayload}`);
    }).catch((error) => {
      debug(`Server Side Event: ${event.eventName} (${error.status})`);
    });
  }, 250);
};

export { fbEvent, fbPageView };
