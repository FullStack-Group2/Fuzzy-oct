// RMIT University Vietnam
// Course: COSC2769 - Full Stack Development
// Semester: 2025B
// Assessment: Assignment 02
// Author: Pham Nhat Minh
// ID: s4019811

export default function NotFoundProduct() {
  return (
    <section className="p-10 w-full aspect-1 flex flex-col gap-5 items-center justify-start">
      <img src="/product-notfound.png" alt="not found product image" />
      <h1 className="text-3xl font-medium">No results found</h1>
      <p className="text-base font-light">
        We couldn't find any product that you search for!
      </p>
    </section>
  );
}
