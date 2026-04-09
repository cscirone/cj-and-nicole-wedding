export function LocationPanel() {
    const locationLink = 'https://example.com/replace-with-location-link'
    const mapEmbedUrl = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3331.715959726517!2d-111.7343051!3d33.3784808!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x872baf1e2697c381%3A0xc6c67ab191696710!2sColby%20Falls%20by%20Wedgewood%20Weddings!5e0!3m2!1sen!2sus!4v1775702235829!5m2!1sen!2sus'

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
                <h2>Address</h2>
                <p><strong>4635 E Baseline Rd, Gilbert, AZ 85234</strong></p>
            </div>

            <div className="overflow-hidden rounded-md border border-wedding-border">
                <iframe
                    title="Wedding venue map"
                    src={mapEmbedUrl}
                    width="100%"
                    height="450"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                />
            </div>
        </div>
    )
}