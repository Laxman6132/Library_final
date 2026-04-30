package com.library.util;

import com.google.zxing.*;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import org.springframework.stereotype.Component;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;
@Component
public class QRGenerator {

    private static final String FOLDER_PATH = "uploads/qr/";
    public static String generateBookQR(int bookId, String isbn) {

        try {
            String data = "BOOK_ID:" + bookId + "|ISBN:" + isbn;

            String fileName = "book_" + bookId + ".png";
            String fullPath = FOLDER_PATH + fileName;

            File file = new File(fullPath);
            if (!file.getParentFile().exists()) {
                file.getParentFile().mkdirs();
            }
            if (file.exists()) {
                file.delete();
            }

            BitMatrix matrix = new MultiFormatWriter()
                    .encode(data, BarcodeFormat.QR_CODE, 250, 250);

            Path path = Paths.get(fullPath);
            MatrixToImageWriter.writeToPath(matrix, "PNG", path);

            return "/qr/" + fileName;

        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }
    public static String generateUserQR(int userId, String token) {

        try {
            String data = "USER_ID:" + userId + "|TOKEN:" + token;

            String fileName = "user_" + userId + ".png";
            String fullPath = FOLDER_PATH + fileName;

            File file = new File(fullPath);
            if (!file.getParentFile().exists()) {
                file.getParentFile().mkdirs();
            }
            if (file.exists()) {
                file.delete();
            }

            BitMatrix matrix = new MultiFormatWriter()
                    .encode(data, BarcodeFormat.QR_CODE, 250, 250);

            Path path = Paths.get(fullPath);
            MatrixToImageWriter.writeToPath(matrix, "PNG", path);

            return "/qr/" + fileName;

        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }

    public static String generateToken() {
        return UUID.randomUUID().toString();
    }
}