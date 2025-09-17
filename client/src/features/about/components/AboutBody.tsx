// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Nhat Minh
// ID: s4019811

export default function AboutBody() {
  return (
    <body>
      <div className="flex flex-col-reverse md:flex-row">
        <div className="w-full md:w-1/2 p-12 md:p-24 flex flex-col gap-10">
          <h1 className="font-light text-4xl">OUR STORY</h1>
          <p className="text-xl font-extralight">
            Our journey began with a vision to redefine how people experience
            luxury furniture. We noticed that while many desired sophistication
            in their homes, the path to finding timeless and elegant pieces
            often felt complicated and exclusive. With this in mind, we built an
            online platform designed to make luxury both approachable and
            seamless. Every collection we curate reflects a deep respect for
            craftsmanship, blending traditional artistry with modern
            sensibilities.
          </p>
          <p className="text-xl font-extralight">
            We believe that furniture is not just functional—it carries stories,
            memories, and emotions that shape daily life. By focusing on quality
            over excess, we offer pieces that embody beauty without unnecessary
            complexity. Our story is ultimately about creating homes that
            inspire, uplift, and reflect the individuality of the people who
            live in them.
          </p>
        </div>
        <img
          src="/about/livingRoom.png"
          className=" w-full md:w-1/2 object-cover"
        />
      </div>

      <div className="flex flex-col md:flex-row">
        <img src="/about/chair.jpeg" className="w-full md:w-1/2 object-cover" />
        <div className="w-full md:w-1/2 p-12 md:p-24 flex flex-col gap-10">
          <h1 className="font-light text-4xl">OUR FOCUS</h1>
          <p className="text-xl font-extralight">
            Our focus is on curating luxury furniture that balances refinement
            with simplicity. We are committed to selecting designs that bring
            lasting elegance, ensuring each piece feels both timeless and
            relevant. Sustainability is central to our philosophy, and we
            prioritize materials and craftsmanship that respect both people and
            the planet. At the heart of our work lies the belief that luxury
            should never be overwhelming, it should enhance a space without
            dominating it. That is why our collections favor clean lines, subtle
            details, and natural finishes that create harmony in any room.
          </p>
          <p className="text-xl font-extralight">
            We strive to make the online experience as effortless as the
            furniture itself, offering a smooth journey from discovery to
            delivery. Ultimately, our focus is not only on furnishing homes but
            also on creating an atmosphere of comfort, sophistication, and
            enduring value.
          </p>
        </div>{' '}
      </div>
    </body>
  );
}
