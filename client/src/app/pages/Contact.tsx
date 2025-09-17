// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Tran Tu Tam
// ID: s3999159

const Contact = () => {
  return (
    <div>
      <header className="relative mb-5 w-full h-56 bg-[#B7F7E1]">
        <img
          src="/backgroundCover.png"
          alt="background cover for shop header"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex items-center justify-center text-black text-5xl font-semibold">
          Contact us
        </div>
      </header>

      <div className="mx-6 md:mx-16 lg:mx-28 mb-10">
        <div className="flex flex-col-reverse md:flex-row my-5 md:my-10">
          <div className="flex flex-col flex-1 mr-0 md:mr-10 lg:mr-20 mt-2 lg:mt-0 [@media(min-width:1200px)]:mt-4 [@media(min-width:1380px)]:mt-9">
            <div className="text-3xl lg:text-3xl [@media(min-width:1200px)]:text-4xl [@media(min-width:1380px)]:text-5xl font-semibold">
              Get in touch with us for your luxury furniture needs
            </div>
            <div className="text-sm lg:text-lg [@media(min-width:1200px)]:text-xl font-extralight my-8 md:my-5 lg:my-10">
              Have questions about our collections, orders, or delivery? Our
              team is here to help you create your perfect home. We deliver
              across Ho Chi Minh City, Da Nang, and Ha Noi.
            </div>
          </div>

          <div className="flex flex-col flex-1">
            <img src="/chair-contact.png" alt="Chair" className="" />
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between pt-3 md:pt-0 lg:pt-6">
          <div className="flex flex-col w-full md:w-52 lg:w-60 [@media(min-width:1200px)]:w-72 [@media(min-width:1380px)]:w-96 mb-4 md:mb-0">
            <div className="font-bold text-sm lg:text-xl text-[#1E7A5A] border-b border-black pb-2">
              Office Location
            </div>
            <div className="font-thin mt-2 text-sm md:text-[11px] lg:text-[16px]">
              702 Nguyen Van Linh Boulevard, Tan Hung Ward, Ho Chi Minh City
            </div>
          </div>

          <div className="flex flex-col w-full md:w-52 lg:w-60 [@media(min-width:1200px)]:w-72 [@media(min-width:1380px)]:w-96 mb-4 md:mb-0">
            <div className="font-bold text-sm lg:text-xl text-[#1E7A5A] border-b border-black pb-2">
              Email
            </div>
            <div className="font-thin mt-2 text-sm md:text-[11px] lg:text-[16px]">
              fuzzy2025@gmail.com
            </div>
          </div>

          <div className="flex flex-col w-full md:w-52 lg:w-60 [@media(min-width:1200px)]:w-72 [@media(min-width:1380px)]:w-96 mb-4 md:mb-0">
            <div className="font-bold text-sm lg:text-xl text-[#1E7A5A] border-b border-black pb-2">
              Phone
            </div>
            <div className="font-thin mt-2 text-sm md:text-[11px] lg:text-[16px]">
              (+84) 0888844444
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center mt-7 md:mt-0 lg:mt-12">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.0674028869485!2d106.69133431117362!3d10.729284789372489!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752fbea5fe3db1%3A0xfae94aca5709003f!2zxJDhuqFpIGjhu41jIFJNSVQgVmnhu4d0IE5hbSAtIEPGoSBz4bufIE5hbSBTw6BpIEfDsm4!5e0!3m2!1sen!2s!4v1756315361433!5m2!1sen!2s"
          width="100%"
          height="350"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        ></iframe>
      </div>
    </div>
  );
};

export default Contact;
