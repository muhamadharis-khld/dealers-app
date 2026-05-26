module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed"
    });
  }

  try {
    const {
      dealerName,
      companyName,
      phoneNumber,
      offerPrice,
      listedTotal,
      notes,
      bikes
    } = req.body;

    const webhookUrl = process.env.LARK_WEBHOOK_URL;

    const bikeList = bikes
      .map(
        (bike, index) =>
          `${index + 1}. ${bike.brand} ${bike.model} (${bike.plate}) - RM ${bike.price}`
      )
      .join("\n");

    const message = {
      msg_type: "text",
      content: {
        text:
`🚨 NEW DEALER REQUEST

Dealer: ${dealerName}
Company: ${companyName}
Phone: ${phoneNumber}

Total List Price: RM ${listedTotal}
Offer Price: RM ${offerPrice}

Selected Bikes:
${bikeList}

Notes:
${notes || "-"}`
      }
    };

    await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(message)
    });

    return res.status(200).json({
      success: true
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
